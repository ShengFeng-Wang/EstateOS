using EstateOS.Domain.Entities;

namespace EstateOS.Application.Common;

public interface ITokenService
{
    string GenerateToken(User user);
}
