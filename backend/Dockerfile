# syntax=docker/dockerfile:1

# ── Build ─────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Project files first, so a source-only change doesn't invalidate the restore layer.
COPY TaskUp.slnx ./
COPY src/TaskUp.Domain/TaskUp.Domain.csproj          src/TaskUp.Domain/
COPY src/TaskUp.Application/TaskUp.Application.csproj src/TaskUp.Application/
COPY src/TaskUp.Infrastructure/TaskUp.Infrastructure.csproj src/TaskUp.Infrastructure/
COPY src/TaskUp.Api/TaskUp.Api.csproj                 src/TaskUp.Api/
RUN dotnet restore src/TaskUp.Api/TaskUp.Api.csproj

COPY . .
RUN dotnet publish src/TaskUp.Api/TaskUp.Api.csproj -c Release -o /app/publish --no-restore

# The database schema is applied as a plain SQL file rather than by running EF at
# startup: an idempotent script can be reviewed before it touches production data,
# and it keeps the .NET SDK out of the runtime image entirely.
RUN dotnet tool install --global dotnet-ef --version 10.* \
 && /root/.dotnet/tools/dotnet-ef migrations script \
      --idempotent \
      --project src/TaskUp.Infrastructure \
      --startup-project src/TaskUp.Api \
      --output /app/migrations.sql

# ── Migration runner ──────────────────────────────────────────────────────────
# Tiny image whose only job is to psql the script in before the API starts.
FROM postgres:16-alpine AS migrations
COPY --from=build /app/migrations.sql /migrations.sql
ENTRYPOINT ["sh", "-c", "psql \"$DATABASE_URL\" -v ON_ERROR_STOP=1 -f /migrations.sql"]

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Never run as root; the uploads volume is chowned to this user in compose.
RUN adduser --system --group --uid 64198 taskup
COPY --from=build /app/publish .
RUN mkdir -p /app/uploads && chown -R taskup:taskup /app

USER taskup
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080 \
    FileStorage__RootPath=/app/uploads
EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskUp.Api.dll"]
