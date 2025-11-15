using System.Linq;
using Microsoft.AspNetCore.Mvc;
using PilatesBooking.Api.Dtos;
using PilatesBooking.Api.Models;
using PilatesBooking.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IClassCatalog, InMemoryClassCatalog>();
builder.Services.AddSingleton<IReservationService, ReservationService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/classes", ([FromServices] IClassCatalog catalog) =>
    Results.Ok(catalog.GetUpcomingClasses().Select(ClassSessionDto.FromModel)))
    .WithName("GetClasses")
    .WithOpenApi();

app.MapPost("/api/reservations", ([FromServices] IReservationService reservationService, [FromBody] ReservationRequest? request) =>
{
    if (request is null)
    {
        return Results.BadRequest(new { message = "Reservation details are required." });
    }

    var validationErrors = ReservationRequestValidator.Validate(request);
    if (validationErrors.Count > 0)
    {
        return Results.ValidationProblem(validationErrors);
    }

    var result = reservationService.CreateReservation(request);
    if (!result.IsSuccess)
    {
        return Results.BadRequest(new { message = result.Error });
    }

    return Results.Created($"/api/reservations/{result.Reservation!.Email}", ReservationDto.FromModel(result.Reservation));
})
.WithName("CreateReservation")
.WithOpenApi();

app.MapGet("/api/reservations/{email}", ([FromServices] IReservationService reservationService, string email) =>
{
    if (string.IsNullOrWhiteSpace(email))
    {
        return Results.BadRequest(new { message = "Email is required." });
    }

    var reservations = reservationService.GetReservationsForEmail(email);
    return Results.Ok(reservations.Select(ReservationDto.FromModel));
})
.WithName("GetReservationsByEmail")
.WithOpenApi();

app.Run();
