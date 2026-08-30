namespace TaskUp.Application.Common.Exceptions;

public class ForbiddenException(string message = "You are not allowed to perform this action.")
    : Exception(message);
