using account_api.Models;
using account_api.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Net;
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
            string connectionString = configuration.GetConnectionString("InventoryConnection");
            _accountRepo = new AccountRepo(connectionString);
            _loginRepo = new LoginRepo(connectionString, configuration);
        }
        [HttpPost]
        [Route("Insert")]
        [Authorize]
        public IActionResult Create(AccountModel model)
        {
            try
            {
                HttpStatusCode statusCode = _accountRepo.InsertAccount(model);

                if (statusCode == HttpStatusCode.OK)
                {
                    return Ok();
                }
                else if (statusCode == HttpStatusCode.BadRequest)
                {
                    return BadRequest();
                }
                else if (statusCode == HttpStatusCode.Conflict)
                {
                    return Conflict();
                }
                else
                {
                    return StatusCode((int)statusCode);
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, new { Message = ex.Message });
            } 
        }


        [HttpGet]
        [Route("Select")]
        public IEnumerable<Models.SelectAccountModel> GetAccounts()
        {
            return _accountRepo.GetAccounts();
        }

        [HttpGet]
        [Route("SelectDeact")]
        public IEnumerable<Models.SelectAccountModel> GetDeactAccounts()
        {
            return _accountRepo.GetDeactAccounts();
        }

        [HttpPost]
        [Route("Login")]
        [AllowAnonymous]
        public IActionResult Login(LoginModel model)
        {
            // Authenticate user and generate JWT token
            var (user, token) = _loginRepo.CheckCredentials(model.username, model.password);

            if (user != null && !string.IsNullOrEmpty(token))
            {
                // Return user information and JWT token
                return Ok(new { User = user, Token = token });
            }

            return Unauthorized();
        }

        [HttpPut("DeactivateAccount")]
        public IActionResult DeactivateAccount(int userId)
        {
            try
            {
                _accountRepo.DeactivateAccount(userId);
                return Ok($"'{userId}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ActivateAccount")]
        public IActionResult ActivateAccount(int userId)
        {
            try
            {
                _accountRepo.ActivateAccount(userId);
                return Ok($"'{userId}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet]
        [Route("GetCountActiveAccounts")]
        public IActionResult GetActiveAccountsCount()
        {
            try
            {
                int count = _accountRepo.GetActiveAccountsCount();
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("GetCountDeactiveAccounts")]
        public IActionResult GetDeactiveAccountsCount()
        {
            try
            {
                int count = _accountRepo.GetDeactiveAccountsCount();
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}
