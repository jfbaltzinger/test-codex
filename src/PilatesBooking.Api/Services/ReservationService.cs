using System.Linq;
using PilatesBooking.Api.Models;

namespace PilatesBooking.Api.Services;

public class ReservationService : IReservationService
{
    private readonly IClassCatalog _classCatalog;
    private readonly List<Reservation> _reservations = new();
    private readonly object _sync = new();

    public ReservationService(IClassCatalog classCatalog)
    {
        _classCatalog = classCatalog;
    }

    public ReservationResult CreateReservation(ReservationRequest request)
    {
        lock (_sync)
        {
            if (!_classCatalog.TryGetClass(request.ClassId, out var session) || session is null)
            {
                return ReservationResult.Failure("La séance demandée est introuvable.");
            }

            var normalizedEmail = request.Email.Trim();

            var alreadyReserved = _reservations.Any(reservation =>
                reservation.ClassId == request.ClassId &&
                string.Equals(reservation.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase));

            if (alreadyReserved)
            {
                return ReservationResult.Failure("Vous avez déjà une réservation pour cette séance.");
            }

            if (!session.TryReserve())
            {
                return ReservationResult.Failure("Cette séance est complète.");
            }

            var reservation = new Reservation(
                Guid.NewGuid(),
                request.ClassId,
                request.FirstName.Trim(),
                request.LastName.Trim(),
                normalizedEmail,
                DateTimeOffset.UtcNow);

            _reservations.Add(reservation);

            return ReservationResult.Success(reservation);
        }
    }

    public IEnumerable<Reservation> GetReservationsForEmail(string email)
    {
        lock (_sync)
        {
            var normalizedEmail = email.Trim();
            return _reservations
                .Where(reservation => string.Equals(reservation.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
                .OrderBy(reservation => reservation.ReservedAt)
                .ToArray();
        }
    }
}
