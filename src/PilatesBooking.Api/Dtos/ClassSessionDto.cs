using PilatesBooking.Api.Models;

namespace PilatesBooking.Api.Dtos;

public record ClassSessionDto(
    Guid Id,
    string Name,
    string Instructor,
    DateTimeOffset StartTime,
    TimeSpan Duration,
    int Capacity,
    int ReservedSpots,
    int AvailableSpots)
{
    public static ClassSessionDto FromModel(ClassSession session) => new(
        session.Id,
        session.Name,
        session.Instructor,
        session.StartTime,
        session.Duration,
        session.Capacity,
        session.ReservedSpots,
        session.AvailableSpots);
}
