using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using account_api.Models;
using account_api.Repository;

namespace account_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReturnBorrowController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        private readonly ReturnBorrowRepo _returnBorrowRepo;

        private readonly string _connectionString;

        public ReturnBorrowController(IConfiguration configuration) {
            _configuration = configuration;
            _connectionString = configuration.GetConnectionString("InventoryConnection");
            _returnBorrowRepo = new ReturnBorrowRepo(_connectionString);
        }

        [HttpGet("GetBorrowHistory")]
        public async Task<ActionResult<IEnumerable<BorrowHistoryItem>>> GetBorrowHistory(int userId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                    SELECT 
                        bh.brw_id,
                        u.firstName + ' '+ u.lastName AS dept_handler ,
                        bh.item_uid,
                        bh.brw_time,
                        bh.borrower,
                        l.location
                    FROM 
                        BorrowHistory bh
                    LEFT JOIN
                        Users u ON bh.user_id = u.user_id
                    LEFT JOIN
                        Location l ON bh.loc_id = l.loc_id
                    WHERE
                        bh.isActive = 1 AND
                        bh.user_id = @userId;";

                var borrowHistory = await connection.QueryAsync<BorrowHistoryItem>(sql, new {userId = userId});

                return Ok(borrowHistory);
            }
        }

        [HttpGet("GetBorrowHistoryLogs")]
        public async Task<ActionResult<IEnumerable<BorrowHistoryItem>>> GetBorrowHistoryLogs()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"SELECT * FROM BorrowHistory;";

                var borrowHistory = await connection.QueryAsync<BorrowHistoryItem>(sql);

                return Ok(borrowHistory);
            }
        }


        [HttpGet("GetBorrowLogs")]
        public async Task<IActionResult> GetBorrowLogs()
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                var query = @"
                    	SELECT
                        bh.brw_id,
                        CONCAT(
                            bh.borrower, 
                            ' from ', 
                            d.department, 
                            ' borrowed ', 
                            bh.item_uid, 
                            ' to be used at ', 
                            l.location
                        ) AS message,
                        u.firstname + ' ' + u.lastname AS dept_handler,
                        FORMAT(bh.brw_time, 'dd-MM-yyyy hh:mm:ss tt') AS formatted_brw_time
                    FROM BorrowHistory bh
                    LEFT JOIN Users u ON bh.user_id = u.user_id
                    LEFT JOIN Location l ON bh.loc_id = l.loc_id
                    LEFT JOIN Department d ON u.department = d.dept_id;";

                var requests = await db.QueryAsync<dynamic>(query);
                return Ok(requests);
            }
        }

        [HttpGet("GetReturnLogs")]
        public async Task<IActionResult> GetRequests()
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                var query = @"
                    	SELECT
                        rh.rt_id,
                        CONCAT(
                            rh.borrower, 
                            ' from ', 
                            d.department, 
                            ' department returned ', 
                            rh.item_uid, 
		                    ' to the department handler ',
                            ' and placed the item at ', 
                            l.location
                        ) AS message,
                        u.firstname + ' ' + u.lastname AS dept_handler,
                        FORMAT(rh.rt_time, 'dd-MM-yyyy hh:mm:ss tt') AS formatted_rt_time
                    FROM ReturnHistory rh
                    LEFT JOIN Users u ON rh.user_id = u.user_id
                    LEFT JOIN Location l ON rh.loc_id = l.loc_id
                    LEFT JOIN Department d ON u.department = d.dept_id;";

                var requests = await db.QueryAsync<dynamic>(query);
                return Ok(requests);
            }
        }

    }
}
