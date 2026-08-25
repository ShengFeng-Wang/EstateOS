using EstateOS.Application.Common;
using Microsoft.AspNetCore.Identity;

namespace EstateOS.Infrastructure.Auth;

public class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<object> _inner = new();

    public string Hash(string password) => _inner.HashPassword(new object(), password);

    public bool Verify(string passwordHash, string providedPassword)
    {
        var result = _inner.VerifyHashedPassword(new object(), passwordHash, providedPassword);
        return result is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
    }
}
