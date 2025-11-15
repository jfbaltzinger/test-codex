using System.ComponentModel.DataAnnotations;

namespace PilatesBooking.Api.Models;

public class ReservationRequest
{
    [Required]
    public Guid ClassId { get; set; }

    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public static class ReservationRequestValidator
{
    public static Dictionary<string, string[]> Validate(ReservationRequest request)
    {
        var validationResults = new List<ValidationResult>();
        var context = new ValidationContext(request);
        Validator.TryValidateObject(request, context, validationResults, true);

        var errors = new Dictionary<string, List<string>>();

        foreach (var result in validationResults)
        {
            var members = result.MemberNames?.ToArray();
            if (members is null || members.Length == 0)
            {
                members = new[] { string.Empty };
            }

            foreach (var member in members)
            {
                if (!errors.TryGetValue(member, out var messages))
                {
                    messages = new List<string>();
                    errors[member] = messages;
                }

                messages.Add(result.ErrorMessage ?? string.Empty);
            }
        }

        return errors.ToDictionary(
            pair => pair.Key,
            pair => pair.Value.ToArray());
    }
}
