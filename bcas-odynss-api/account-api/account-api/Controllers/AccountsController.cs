using account_api.Models;
using account_api.Repository;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System.Data.SqlClient;
using System.Net;
using System.Security.Principal;
using static System.Net.Mime.MediaTypeNames;

namespace account_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly AccountRepo _accountRepo;
        private readonly LoginRepo _loginRepo;
        private readonly IConfiguration _configuration;

        public AccountsController(IConfiguration configuration)
        {
            string connectionString = configuration.GetConnectionString("InventoryConnection");
            _accountRepo = new AccountRepo(connectionString, configuration);
            _loginRepo = new LoginRepo(connectionString, configuration);
            _configuration = configuration;
        }

        [HttpPost]
        [Route("Insert")]
     
        public IActionResult Create(AccountModel model, int creatorId)
        {
            try
            {
                HttpStatusCode statusCode = _accountRepo.InsertAccount(model, creatorId);

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
        public IActionResult DeactivateAccount(int userId, int creatorId)
        {
            try
            {
                _accountRepo.DeactivateAccount(userId, creatorId);
                return Ok($"'{userId}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ActivateAccount")]
        public IActionResult ActivateAccount(int userId, int creatorId)
        {
            try
            {
                _accountRepo.ActivateAccount(userId, creatorId);
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

        [HttpGet]
        [Route("SelectViaUid")]
        public IEnumerable<Models.SelectAccountModel> GetAccountViaId(int userId)
        {
            return _accountRepo.GetAccountViaId(userId);
        }

        [HttpPut("EditAccount")]
        public IActionResult EditAccount([FromBody] EditAccountModel model, int creatorId)
        {
            try
            {
                // Validate parameters
                if (string.IsNullOrEmpty(model.firstName) || string.IsNullOrEmpty(model.lastName) || string.IsNullOrEmpty(model.email))
                {
                    return BadRequest("Invalid parameters. All fields must be provided.");
                }

                HttpStatusCode statusCode = _accountRepo.EditAccount(model.userId, model.firstName, model.lastName, model.email, creatorId);

                if (statusCode == HttpStatusCode.OK)
                {
                    return Ok($"User with ID '{model.userId}' edited successfully.");
                }
                else if (statusCode == HttpStatusCode.Conflict)
                {
                    return Conflict("Email is already in use.");
                }
                else
                {
                    // Unexpected status code, return internal server error
                    return StatusCode(500, "An unexpected error occurred while editing the account.");
                }
            }
            catch (Exception ex)
            {

                // Return internal server error with a generic error message
                return StatusCode(500, "An error occurred while processing the request.");
            }
        }

        [HttpPost("SendChangePasswordEmail")]
        public IActionResult SendChangePasswordEmail(string recipientEmail)
        {
            try
            {
                _accountRepo.SendChangePasswordEmail(recipientEmail);
                return Ok("Change password email sent successfully.");
            }
            catch (Exception ex)
            {
                if (ex.Message == "Invalid user or inactive account.")
                {
                    return StatusCode(404, "Invalid user or inactive account.");
                }
                else
                {
                    return StatusCode(500, $"An error occurred: {ex.Message}");
                }
            }
        }

        [HttpPut("ChangePasswordViaLink")]
        public IActionResult ChangePasswordViaLink(string username, [FromBody] string password)
        {
            var result = _accountRepo.ChangePasswordViaLink(username, password);

            switch (result)
            {
                case HttpStatusCode.OK:
                    return Ok("Password changed successfully.");
                case HttpStatusCode.NotFound:
                    return NotFound("User not found.");
                default:
                    return StatusCode((int)result, "An error occurred while processing the request.");
            }
        }

        [HttpGet("expired")]
        public IActionResult IsTokenExpired([FromQuery] string token)
        {
            try
            {
                var isExpired = AccountRepo.IsTokenExpired(token, _configuration);
                return Ok(new { expired = isExpired });
            }
            catch (Exception)
            {
                // Handle any exceptions
                return StatusCode(500, "An error occurred while checking token expiration.");
            }
        }

        [HttpGet("AccountLogs")]
        public IActionResult GetAccountLogs()
        {
            try
            {
                IEnumerable<AccountLogModel> accountLogs = _accountRepo.GetAccountLogs();
                return Ok(accountLogs);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"An error occurred: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

    }
}
