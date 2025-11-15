namespace PilatesBooking.Api.Models;

public class Reservation
{
    public Reservation(Guid id, Guid classId, string firstName, string lastName, string email, DateTimeOffset reservedAt)
    {
        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        ClassId = classId;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        ReservedAt = reservedAt;
    }

    public Guid Id { get; }

    public Guid ClassId { get; }

    public string FirstName { get; }

    public string LastName { get; }

    public string Email { get; }

    public DateTimeOffset ReservedAt { get; }
}
