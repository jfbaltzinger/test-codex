using PilatesBooking.Api.Models;

namespace PilatesBooking.Api.Services;

public interface IReservationService
{
    ReservationResult CreateReservation(ReservationRequest request);

    IEnumerable<Reservation> GetReservationsForEmail(string email);
}
