using System.Collections.Concurrent;
using System.Linq;
using PilatesBooking.Api.Models;

namespace PilatesBooking.Api.Services;

public class InMemoryClassCatalog : IClassCatalog
{
    private readonly ConcurrentDictionary<Guid, ClassSession> _classes;

    public InMemoryClassCatalog()
    {
        var now = DateTimeOffset.Now;
        var upcoming = new[]
        {
            new ClassSession(
                Guid.NewGuid(),
                "Pilates Débutant",
                "Sophie Martin",
                new DateTimeOffset(now.Date.AddDays(1).AddHours(9), now.Offset),
                TimeSpan.FromMinutes(55),
                capacity: 12),
            new ClassSession(
                Guid.NewGuid(),
                "Pilates Intermédiaire",
                "Lucas Bernard",
                new DateTimeOffset(now.Date.AddDays(2).AddHours(18), now.Offset),
                TimeSpan.FromMinutes(60),
                capacity: 10),
            new ClassSession(
                Guid.NewGuid(),
                "Pilates Renforcement",
                "Emma Dubois",
                new DateTimeOffset(now.Date.AddDays(3).AddHours(7), now.Offset),
                TimeSpan.FromMinutes(45),
                capacity: 8)
        };

        _classes = new ConcurrentDictionary<Guid, ClassSession>(
            upcoming.ToDictionary(session => session.Id));
    }

    public IEnumerable<ClassSession> GetUpcomingClasses() =>
        _classes.Values
            .OrderBy(session => session.StartTime)
            .ToArray();

    public bool TryGetClass(Guid id, out ClassSession? session) =>
        _classes.TryGetValue(id, out session);
}
