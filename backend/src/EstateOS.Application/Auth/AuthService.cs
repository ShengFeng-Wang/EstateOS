using EstateOS.Application.Common;
using EstateOS.Domain;
using Microsoft.EntityFrameworkCore;

namespace EstateOS.Application.Auth;

public class AuthService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(IAppDbContext db, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == request.Email, ct);

        if (user is null || !_passwordHasher.Verify(user.PasswordHash, request.Password))
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.Status != UserStatus.Active)
        {
            throw new UnauthorizedException("This account is inactive.");
        }

        var token = _tokenService.GenerateToken(user);
        return new LoginResponse(token, ToDto(user));
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _db.Users.FindAsync([userId], ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), userId);
        return ToDto(user);
    }

    private static UserDto ToDto(Domain.Entities.User u) => new(u.Id, u.Name, u.Email, u.Role, u.Status, u.CreatedAt);
}
