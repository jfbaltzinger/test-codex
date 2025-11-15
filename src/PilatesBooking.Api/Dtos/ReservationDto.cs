using PilatesBooking.Api.Models;

namespace PilatesBooking.Api.Dtos;

public record ReservationDto(
    Guid Id,
    Guid ClassId,
    string FirstName,
    string LastName,
    string Email,
    DateTimeOffset ReservedAt)
{
    public static ReservationDto FromModel(Reservation reservation) => new(
        reservation.Id,
        reservation.ClassId,
        reservation.FirstName,
        reservation.LastName,
        reservation.Email,
        reservation.ReservedAt);
}
