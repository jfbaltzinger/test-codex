using PilatesBooking.Api.Models;

namespace PilatesBooking.Api.Services;

public class ReservationResult
{
    private ReservationResult(Reservation? reservation, string? error)
    {
        Reservation = reservation;
        Error = error;
    }

    public Reservation? Reservation { get; }

    public string? Error { get; }

    public bool IsSuccess => Reservation is not null;

    public static ReservationResult Success(Reservation reservation) => new(reservation, null);

    public static ReservationResult Failure(string error) => new(null, error);
}
