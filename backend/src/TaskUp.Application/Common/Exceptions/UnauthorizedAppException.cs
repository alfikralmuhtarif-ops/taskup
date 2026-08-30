namespace TaskUp.Application.Common.Exceptions;

public class UnauthorizedAppException(string message = "Invalid or expired credentials.")
    : Exception(message);
