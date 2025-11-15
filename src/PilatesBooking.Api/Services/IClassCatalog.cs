using PilatesBooking.Api.Models;

namespace PilatesBooking.Api.Services;

public interface IClassCatalog
{
    IEnumerable<ClassSession> GetUpcomingClasses();

    bool TryGetClass(Guid id, out ClassSession? session);
}
