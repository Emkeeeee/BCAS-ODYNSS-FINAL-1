using account_api.Models;
using account_api.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Security.Principal;

namespace account_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly AccountRepo _accountRepo;
        private readonly LoginRepo _loginRepo;

        public AccountsController(IConfiguration configuration)
        {
            string connectionString = configuration.GetConnectionString("AccountsConnection");
            _accountRepo = new AccountRepo(connectionString);
            _loginRepo = new LoginRepo(connectionString);
        }

        [HttpPost]
        [Route("Insert")]
        public IActionResult Create(AccountModel model)
        {
            _accountRepo.InsertAccount(model);
            return Ok();
        }

        [HttpGet]
        [Route("Select")]
        public IEnumerable<Models.AccountModel> GetAccounts()
        {
            return _accountRepo.GetAccounts();
        }

        [HttpPost]
        [Route("Login")]
        public IActionResult Login(LoginModel model)
        {

            var loginModel = _loginRepo.CheckCredentials(model.username, model.password);

            if (loginModel != null)
            {
                return Ok(loginModel);
            }

            return Unauthorized();
        }
    }
}
