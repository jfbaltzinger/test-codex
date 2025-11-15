namespace PilatesBooking.Api.Models;

public class ClassSession
{
    private readonly object _sync = new();
    private int _reservedSpots;

    public ClassSession(
        Guid id,
        string name,
        string instructor,
        DateTimeOffset startTime,
        TimeSpan duration,
        int capacity,
        int reservedSpots = 0)
    {
        if (capacity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(capacity), "Capacity must be greater than zero.");
        }

        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        Name = name;
        Instructor = instructor;
        StartTime = startTime;
        Duration = duration;
        Capacity = capacity;
        _reservedSpots = Math.Clamp(reservedSpots, 0, capacity);
    }

    public Guid Id { get; }

    public string Name { get; }

    public string Instructor { get; }

    public DateTimeOffset StartTime { get; }

    public TimeSpan Duration { get; }

    public int Capacity { get; }

    public int ReservedSpots
    {
        get
        {
            lock (_sync)
            {
                return _reservedSpots;
            }
        }
    }

    public int AvailableSpots
    {
        get
        {
            lock (_sync)
            {
                return Math.Max(0, Capacity - _reservedSpots);
            }
        }
    }

    public bool TryReserve()
    {
        lock (_sync)
        {
            if (_reservedSpots >= Capacity)
            {
                return false;
            }

            _reservedSpots++;
            return true;
        }
    }
}
