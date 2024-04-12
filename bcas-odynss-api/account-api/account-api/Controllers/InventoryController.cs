using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using account_api.Models;
using account_api.Repository;
using Org.BouncyCastle.Asn1.Ocsp;

namespace account_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class InventoryController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        private readonly InventoryRepo _inventoryRepo;

        private readonly string _connectionString;

        public InventoryController(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = configuration.GetConnectionString("InventoryConnection");
            _inventoryRepo = new InventoryRepo(_connectionString);
        }

        [HttpGet("GetActiveItems")]
        public async Task<ActionResult<IEnumerable<ItemSummary>>> GetActiveItems(int dept_id,
        int? cat_id = null,
        int? subCat_id = null,
        int? unqFeat_id = null,
        int? loc_id = null,
        string? item_uid = null)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                    SELECT 
                        item_name,
                        item_desc,
                        COUNT(*) AS qty,
                        SUM(CASE WHEN isOut = 0 THEN 1 ELSE 0 END) AS stock
                    FROM 
                        Items i
                    WHERE 
                        isActive = 1 AND isBroken = 0 AND dept_id = @dept_id";
                if (cat_id.HasValue)
                {
                    sql += " AND i.cat_id = @cat_id";
                }

                if (subCat_id.HasValue)
                {
                    sql += " AND i.subCat_id = @subCat_id";
                }

                if (unqFeat_id.HasValue)
                {
                    sql += " AND i.unqFeat_id = @unqFeat_id";
                }

                if (loc_id.HasValue)
                {
                    sql += " AND i.loc_id = @loc_id";
                }
                if (!string.IsNullOrWhiteSpace(item_uid))
                {
                    sql += " AND i.item_uid = @item_uid";
                }

                sql += @"
                    GROUP BY 
                        item_name, 
                        item_desc;";

                var parameters = new DynamicParameters();
                parameters.Add("@dept_id", dept_id);

                if (cat_id.HasValue) parameters.Add("@cat_id", cat_id);
                if (subCat_id.HasValue) parameters.Add("@subCat_id", subCat_id);
                if (unqFeat_id.HasValue) parameters.Add("@unqFeat_id", unqFeat_id);
                if (loc_id.HasValue) parameters.Add("@loc_id", loc_id);
                if (!string.IsNullOrWhiteSpace(item_uid))
                {
                    parameters.Add("@item_uid", item_uid);
                }

                var items = await connection.QueryAsync<ItemSummary>(sql, parameters);

                return Ok(items);
            }
        }

        [HttpGet("GetActiveItemsExpandable")]
        public async Task<ActionResult<IEnumerable<ItemSummary>>> GetActiveItemsExpandable(
        int dept_id,
        int? cat_id = null,
        int? subCat_id = null,
        int? unqFeat_id = null,
        int? loc_id = null,
        string? item_uid = null)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
            SELECT 
                i.item_name,
                i.item_desc,
                COUNT(*) AS qty,
                SUM(CASE WHEN i.isOut = 0 THEN 1 ELSE 0 END) AS stock,
                i.item_uid,
                i.dept_id,
                i.remarks,
                i.invTime,
                u.firstName AS invBy,
                i.isOut,
                i.borrowBy,
                l.location
            FROM 
                Items i
            LEFT JOIN 
                Users u ON i.invBy = u.user_id 
            LEFT JOIN 
                Location l ON i.loc_id = l.loc_id 
            WHERE 
                i.isActive = 1 
                AND i.isBroken = 0 
                AND i.dept_id = @dept_id";

                if (cat_id.HasValue)
                {
                    sql += " AND i.cat_id = @cat_id";
                }

                if (subCat_id.HasValue)
                {
                    sql += " AND i.subCat_id = @subCat_id";
                }

                if (unqFeat_id.HasValue)
                {
                    sql += " AND i.unqFeat_id = @unqFeat_id";
                }

                if (loc_id.HasValue)
                {
                    sql += " AND i.loc_id = @loc_id";
                }

                if (!string.IsNullOrWhiteSpace(item_uid))
                {
                    sql += " AND i.item_uid = @item_uid";
                }

                sql += @"
            GROUP BY 
                i.item_name, 
                i.item_desc,
                i.remarks,
                i.item_uid,
                i.dept_id,
                i.invTime,
                u.firstName,
                i.isOut,
                i.borrowBy,
                l.location;
        ";

                var parameters = new DynamicParameters();
                parameters.Add("@dept_id", dept_id);

                if (cat_id.HasValue) parameters.Add("@cat_id", cat_id);
                if (subCat_id.HasValue) parameters.Add("@subCat_id", subCat_id);
                if (unqFeat_id.HasValue) parameters.Add("@unqFeat_id", unqFeat_id);
                if (loc_id.HasValue) parameters.Add("@loc_id", loc_id);
                if (!string.IsNullOrWhiteSpace(item_uid))
                {
                    parameters.Add("@item_uid", item_uid);
                }

                var items = await connection.QueryAsync<ItemSummary>(sql, parameters);

                return Ok(items);
            }
        }

        // ----------------------------------------------------------------------------------------------------------

        [HttpGet("GetDisabledItem")]
        public async Task<ActionResult<IEnumerable<ItemSummary>>> GetDisabledItem(int dept_id,
       int? cat_id = null,
       int? subCat_id = null,
       int? unqFeat_id = null,
       int? loc_id = null,
       string? item_uid = null)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                    SELECT 
                        item_name,
                        item_desc,
                        COUNT(*) AS qty,
                        SUM(CASE WHEN isOut = 0 THEN 1 ELSE 0 END) AS stock
                    FROM 
                        Items i
                    WHERE 
                        isActive = 0 AND isBroken = 0 AND dept_id = @dept_id";
                if (cat_id.HasValue)
                {
                    sql += " AND i.cat_id = @cat_id";
                }

                if (subCat_id.HasValue)
                {
                    sql += " AND i.subCat_id = @subCat_id";
                }

                if (unqFeat_id.HasValue)
                {
                    sql += " AND i.unqFeat_id = @unqFeat_id";
                }

                if (loc_id.HasValue)
                {
                    sql += " AND i.loc_id = @loc_id";
                }
                if (!string.IsNullOrWhiteSpace(item_uid))
                {
                    sql += " AND i.item_uid = @item_uid";
                }

                sql += @"
                    GROUP BY 
                        item_name, 
                        item_desc;";

                var parameters = new DynamicParameters();
                parameters.Add("@dept_id", dept_id);

                if (cat_id.HasValue) parameters.Add("@cat_id", cat_id);
                if (subCat_id.HasValue) parameters.Add("@subCat_id", subCat_id);
                if (unqFeat_id.HasValue) parameters.Add("@unqFeat_id", unqFeat_id);
                if (loc_id.HasValue) parameters.Add("@loc_id", loc_id);
                if (!string.IsNullOrWhiteSpace(item_uid))
                {
                    parameters.Add("@item_uid", item_uid);
                }

                var items = await connection.QueryAsync<ItemSummary>(sql, parameters);

                return Ok(items);
            }
        }

        [HttpGet("GetDisabledItemsExpandable")]
        public async Task<ActionResult<IEnumerable<ItemSummary>>> GetDisabledItemsExpandable(
        int dept_id,
        int? cat_id = null,
        int? subCat_id = null,
        int? unqFeat_id = null,
        int? loc_id = null,
        string? item_uid = null)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
            SELECT 
                i.item_name,
                i.item_desc,
                COUNT(*) AS qty,
                SUM(CASE WHEN i.isOut = 0 THEN 1 ELSE 0 END) AS stock,
                i.item_uid,
                i.dept_id,
                i.remarks,
                i.invTime,
                u.firstName AS invBy,
                i.isOut,
                i.borrowBy,
                l.location
            FROM 
                Items i
            LEFT JOIN 
                Users u ON i.invBy = u.user_id 
            LEFT JOIN 
                Location l ON i.loc_id = l.loc_id 
            WHERE 
                i.isActive = 0 
                AND i.isBroken = 0 
                AND i.dept_id = @dept_id";

                if (cat_id.HasValue)
                {
                    sql += " AND i.cat_id = @cat_id";
                }

                if (subCat_id.HasValue)
                {
                    sql += " AND i.subCat_id = @subCat_id";
                }

                if (unqFeat_id.HasValue)
                {
                    sql += " AND i.unqFeat_id = @unqFeat_id";
                }

                if (loc_id.HasValue)
                {
                    sql += " AND i.loc_id = @loc_id";
                }

                if (!string.IsNullOrWhiteSpace(item_uid))
                {
                    sql += " AND i.item_uid = @item_uid";
                }

                sql += @"
            GROUP BY 
                i.item_name, 
                i.item_desc,
                i.remarks,
                i.item_uid,
                i.dept_id,
                i.invTime,
                u.firstName,
                i.isOut,
                i.borrowBy,
                l.location;
        ";

                var parameters = new DynamicParameters();
                parameters.Add("@dept_id", dept_id);

                if (cat_id.HasValue) parameters.Add("@cat_id", cat_id);
                if (subCat_id.HasValue) parameters.Add("@subCat_id", subCat_id);
                if (unqFeat_id.HasValue) parameters.Add("@unqFeat_id", unqFeat_id);
                if (loc_id.HasValue) parameters.Add("@loc_id", loc_id);
                if (!string.IsNullOrWhiteSpace(item_uid))
                {
                    parameters.Add("@item_uid", item_uid);
                }

                var items = await connection.QueryAsync<ItemSummary>(sql, parameters);

                return Ok(items);
            }
        }

        [HttpPut("RestoreItem")]
        public IActionResult RestoreItem(string itemUID)
        {
            try
            {
                _inventoryRepo.RestoreItem(itemUID);
                return Ok($"'{itemUID}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("GetReplaceItemViaUid")]
        public async Task<ActionResult<IEnumerable<ItemSummary>>> GetReplaceItemViaUid(int dept_id, string item_uid)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
            SELECT 
				i.item_uid,
                i.item_name,
                i.item_desc,
                i.remarks,
				i.dept_id,
				i.cat_id,
				i.subCat_id,
				i.unqFeat_id,
				i.unqFeat,
                i.invTime,
                i.invBy,
                i.loc_id
            FROM 
                Items i
            WHERE 
                i.isActive = 1 
                AND i.isBroken = 1 
                AND i.dept_id = @dept_id
				AND item_uid = @item_uid

            GROUP BY 
                i.item_uid,
                i.item_name,
                i.item_desc,
                i.remarks,
				i.dept_id,
				i.cat_id,
				i.subCat_id,
				i.unqFeat_id,
				i.unqFeat,
                i.invTime,
                i.invBy,
                i.loc_id";

                var parameters = new DynamicParameters();
                parameters.Add("@dept_id", dept_id);
                parameters.Add("@item_uid", item_uid);

                var items = await connection.QueryAsync<InventoryDataModel>(sql, parameters);

                return Ok(items);
            }
        }

        // ---------------------------------------------------------------------------------------------------

        [HttpGet("GetItemViaUid")]
        public async Task<ActionResult<IEnumerable<ItemSummary>>> GetItemViaUid(int dept_id, string item_uid)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
            SELECT 
				i.item_uid,
                i.item_name,
                i.item_desc,
                i.remarks,
				i.dept_id,
				i.cat_id,
				i.subCat_id,
				i.unqFeat_id,
				i.unqFeat,
                i.invTime,
                i.invBy,
                i.loc_id
            FROM 
                Items i
            WHERE 
                i.isActive = 1 
                AND i.isBroken = 0 
                AND i.dept_id = @dept_id
				AND item_uid = @item_uid

            GROUP BY 
                i.item_uid,
                i.item_name,
                i.item_desc,
                i.remarks,
				i.dept_id,
				i.cat_id,
				i.subCat_id,
				i.unqFeat_id,
				i.unqFeat,
                i.invTime,
                i.invBy,
                i.loc_id";

                var parameters = new DynamicParameters();
                parameters.Add("@dept_id", dept_id);
                parameters.Add("@item_uid", item_uid);

                var items = await connection.QueryAsync<InventoryDataModel>(sql, parameters);

                return Ok(items);
            }
        }


        [HttpGet("GetDepartments")]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                    SELECT 
                        dept_id,
                        department,
                        acronym,
                        isActive
                    FROM 
                        Department
                    WHERE
                        isActive = 1;";

                var departments = await connection.QueryAsync<Department>(sql);

                return Ok(departments);
            }
        }

        [HttpGet("GetSubCategory")]
        public async Task<ActionResult<IEnumerable<Department>>> GetSubCategory(int cat_id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                    SELECT
                    sc.subCat_id,
                    sc.cat_id,
                    sc.subCategory,
                    sc.acronym,
                    sc.isActive
                FROM 
                    SubCategory sc
                LEFT JOIN 
                    Category c ON sc.cat_id = c.cat_id
                WHERE
                    sc.isActive = 1
                    AND sc.cat_id = @cat_id;";

                var subCategory = await connection.QueryAsync<SubCategory>(sql, new { cat_id });

                return Ok(subCategory);
            }
        }

        [HttpGet("GetCategory")]
        public async Task<ActionResult<IEnumerable<Department>>> GetCategory()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                    SELECT 
                        cat_id,
                        category,
                        acronym,
                        isActive
                    FROM 
                        Category
                    WHERE
                        isActive = 1;";

                var category = await connection.QueryAsync<Category>(sql);

                return Ok(category);
            }
        }

        [HttpGet("GetLocation")]
        public async Task<ActionResult<IEnumerable<Department>>> GetLocation()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                    SELECT 
                        loc_id,
                        location,
                        isActive
                    FROM 
                        Location
                    WHERE
                        isActive = 1;";

                var location = await connection.QueryAsync<Location>(sql);

                return Ok(location);
            }
        }

        [HttpGet("GetUniqueFeature")]
        public async Task<ActionResult<IEnumerable<Department>>> GetUniqueFeature()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                    SELECT 
                        unqFeat_id,
                        unqFeature,
                        isActive
                    FROM 
                        UniqueFeature
                       WHERE
                        isActive = 1;";

                var uf = await connection.QueryAsync<UniqueFeature>(sql);

                return Ok(uf);
            }
        }

        [HttpGet("GetUniqueFeatureValue")]
        public async Task<ActionResult<IEnumerable<UniqueFeatureValue>>> GetUniqueFeatureValue(int unqFeat_id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                    SELECT 
                        ufv.unqFeatVal_id,
                        ufv.unqFeat_id,
                        ufv.unqFeatVal,
                        ufv.isActive
                    FROM 
                        UniqueFeatureValues ufv
                    LEFT JOIN 
                        UniqueFeature uf ON ufv.unqFeat_id = uf.unqFeat_id
                    WHERE
                        ufv.unqFeat_id = @unqFeat_id
                        AND ufv.isActive = 1;";

                var ufv = await connection.QueryAsync<UniqueFeatureValue>(sql, new { unqFeat_id });

                return Ok(ufv);
            }
        }

        [HttpPost("AddItem")]
        public async Task<IActionResult> AddItem(InventoryModel item, int creatorId)
        {
            try
            {
                // Call the repository method to add the item
                int newItemId = await _inventoryRepo.AddItemAsync(item, creatorId);

                // Optionally, return the newly created item ID
                return Ok(newItemId);
            }
            catch (Exception ex)
            {
                // Handle any exceptions and return an appropriate response
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("DeactivateItem")]
        public IActionResult DeactivateItem(string itemUID, int creatorId)
        {
            try
            {
                _inventoryRepo.DeactivateItem(itemUID, creatorId);
                return Ok($"Item with UID '{itemUID}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ActivateItem")]
        public IActionResult ActivateItem(string itemUID, int creatorId)
        {
            try
            {
                _inventoryRepo.ActivateItem(itemUID, creatorId);
                return Ok($"Item with UID '{itemUID}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("BorrowItem")]
        public IActionResult BorrowItem(BorrowModel model)
        {
            try
            {
                _inventoryRepo.BorrowItem(model.item_uid, model.borrow_name, model.loc_id, model.user_id);
                return Ok($"Item with UID '{model.item_uid}' borrowed successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ReturnItem")]
        public IActionResult ReturnItem(string itemUID, int brw_id, int loc_id, bool isBroken)
        {
            try
            {
                _inventoryRepo.ReturnItem(itemUID, brw_id, loc_id, isBroken);
                return Ok($"Item with UID '{itemUID}' returned successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("UpdateItemViaUid")]
        public async Task<ActionResult> UpdateItemViaUid([FromBody] InventoryDataModel updatedItem, int creatorId)
        {
            if (updatedItem == null)
            {
                return BadRequest("Invalid data provided");
            }

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Retrieve department, category, and subcategory acronyms
                string deptAcronymSql = "SELECT acronym FROM Department WHERE dept_id = @dept_id";
                string catAcronymSql = "SELECT acronym FROM Category WHERE cat_id = @cat_id";
                string subCatAcronymSql = "SELECT acronym FROM SubCategory WHERE subCat_id = @subCat_id";

                string deptAcronym = await connection.ExecuteScalarAsync<string>(deptAcronymSql, new { dept_id = updatedItem.dept_id });
                string catAcronym = await connection.ExecuteScalarAsync<string>(catAcronymSql, new { cat_id = updatedItem.cat_id });
                string subCatAcronym = await connection.ExecuteScalarAsync<string>(subCatAcronymSql, new { subCat_id = updatedItem.subCat_id });

                // Construct new item UID
                string itemUid = $"{updatedItem.item_name}_{deptAcronym}_{catAcronym}_{subCatAcronym}_{updatedItem.unqFeat}";
                string nextUid = Guid.NewGuid().ToString("N").Substring(0, 8);

                // SQL query to update the item
                string sql = @"
            UPDATE Items
            SET 
                item_uid = @item_uid,
                item_name = @item_name,
                item_desc = @item_desc,
                remarks = @remarks,
                dept_id = @dept_id,
                cat_id = @cat_id,
                subCat_id = @subCat_id,
                unqFeat_id = @unqFeat_id,
                unqFeat = @unqFeat,
                invTime = @invTime,
                invBy = @invBy,
                loc_id = @loc_id,
                isBroken = 0
            WHERE 
                item_uid = @old_item_uid"; // Use the old item UID to locate the record

                var parameters = new
                {
                    item_uid = itemUid + "_" + nextUid, // Updated UID
                    old_item_uid = updatedItem.old_item_uid, // Old UID to locate the record
                                                             // Other fields
                    item_name = updatedItem.item_name,
                    item_desc = updatedItem.item_desc,
                    remarks = updatedItem.remarks,
                    dept_id = updatedItem.dept_id,
                    cat_id = updatedItem.cat_id,
                    subCat_id = updatedItem.subCat_id,
                    unqFeat_id = updatedItem.unqFeat_id,
                    unqFeat = updatedItem.unqFeat,
                    invTime = DateTime.Now,
                    invBy = updatedItem.invBy,
                    loc_id = updatedItem.loc_id
                };

                // Execute the update query
                var affectedRows = await connection.ExecuteAsync(sql, parameters);

                // Check if any rows were affected
                if (affectedRows > 0)
                {
                    // Log the update action in the ItemLogs table
                    string logSql = @"
                INSERT INTO ItemLogs (item_uid, creator_id, action, time)
                VALUES (@item_uid, @creator_id, @action, @time);";

                    await connection.ExecuteAsync(logSql, new
                    {
                        item_uid = updatedItem.old_item_uid, // Log with the old UID
                        creator_id = creatorId,
                        action = $"Item Updated into {itemUid + "_" + nextUid}",
                        time = DateTime.Now
                    });

                    return Ok("Item updated successfully");
                }
                else
                {
                    return NotFound("Item not found");
                }
            }
        }


        [HttpGet("GetBrokenItem")]
        public async Task<ActionResult<IEnumerable<ItemSummary>>> GetBrokenItem(int dept_id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
            SELECT 
                i.item_name,
                i.item_desc,
                COUNT(*) AS qty,
                SUM(CASE WHEN i.isOut = 0 THEN 1 ELSE 0 END) AS stock,
                i.item_uid,
                i.remarks,
                i.invTime,
                u.firstName AS invBy,
                i.isOut,
                i.borrowBy,
                l.location
            FROM 
                Items i
            LEFT JOIN 
                Users u ON i.invBy = u.user_id 
            LEFT JOIN 
                Location l ON i.loc_id = l.loc_id 
            WHERE 
                i.isActive = 1 
                AND i.isBroken = 1 
                AND i.dept_id = @dept_id
            GROUP BY 
                i.item_name, 
                i.item_desc,
                i.remarks,
                i.item_uid,
                i.invTime,
                u.firstName,
                i.isOut,
                i.borrowBy,
                l.location;";

                var parameters = new DynamicParameters();
                parameters.Add("@dept_id", dept_id);

                var items = await connection.QueryAsync<ItemSummary>(sql, parameters);

                return Ok(items);
            }
        }

        // ---------------------------------------------------------------------------------------------------------

        [HttpPost("RequestItem")]
        public async Task<IActionResult> CreateRequest(RequestModel request)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                var query = @"INSERT INTO Request (item_uid, requester_id, borrower, dept_id, loc_id, isAccepted, isDenied) 
                      VALUES (@item_uid, @requester_id, @borrower, @dept_id, @loc_id, 0, 0)";
                await db.ExecuteAsync(query, request);
                return Ok();
            }
        }

        [HttpGet("RequestCountDepartment")]
        public async Task<IActionResult> GetRequestCountByDeptId(int deptId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                var query = "SELECT COUNT(*) FROM Request WHERE dept_id = @DeptId AND isAccepted = 0 AND isDenied = 0";
                var count = await db.QueryFirstOrDefaultAsync<int>(query, new { DeptId = deptId });
                return Ok(count);
            }
        }

        [HttpGet("GetRequests")]
        public async Task<IActionResult> GetRequests(int deptId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                var query = @"
                    SELECT
                        r.rq_id,
                        r.item_uid,
                        r.borrower,
                        r.loc_id,
                        r.requester_id,
                        CONCAT(
                            r.borrower, 
                            ' from ', 
                            d.department, 
                            ' department wants to borrow ', 
                            r.item_uid, 
                            ' to be used at ', 
                            l.location
                        ) AS message
                    FROM Request r
                    LEFT JOIN Users u ON r.requester_id = u.user_id
                    LEFT JOIN Location l ON r.loc_id = l.loc_id
                    LEFT JOIN Department d ON u.department = d.dept_id
                    WHERE
                    isAccepted = 0 AND isDenied = 0 AND r.dept_id = @DeptId";

                var requests = await db.QueryAsync<dynamic>(query, new { DeptId = deptId });
                return Ok(requests);
            }
        }

        [HttpPut("AcceptRequestBorrow")]
        public IActionResult AcceptRequestBorrow(RequestBorrowModel model)
        {
            try
            {
                using (IDbConnection db = new SqlConnection(_connectionString))
                {
                    var query = "UPDATE Request SET isAccepted = 1 WHERE rq_id = @RequestId";
                    db.Execute(query, new { RequestId = model.rq_id });
                }

                _inventoryRepo.BorrowItem(model.item_uid, model.borrower, model.loc_id, model.requester_id);
                return Ok($"Item with UID '{model.item_uid}' borrowed successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("GetItemLogs")]
        public async Task<ActionResult<IEnumerable<ItemLogModel>>> GetItemLogs()
        {
            try
            {
                var logs = await _inventoryRepo.GetItemLogs();
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
