using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using account_api.Models;
using account_api.Repository;
using System.Drawing;
using System.Drawing.Imaging;
using ZXing;
using ZXing.Common;
using ZXing.QrCode;


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
        public async Task<IActionResult> AddItem(InventoryModel item)
        {
            try
            {
                // Call the repository method to add the item
                int newItemId = await _inventoryRepo.AddItemAsync(item);

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
        public IActionResult DeactivateItem(string itemUID)
        {
            try
            {
                _inventoryRepo.DeactivateItem(itemUID);
                return Ok($"Item with UID '{itemUID}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ActivateItem")]
        public IActionResult ActivateItem(string itemUID)
        {
            try
            {
                _inventoryRepo.DeactivateItem(itemUID);
                return Ok($"Item with UID '{itemUID}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("BorrowItem")]
        public IActionResult BorrowItem(string itemUID, string borrower, int locId)
        {
            try
            {
                _inventoryRepo.BorrowItem(itemUID, borrower, locId);
                return Ok($"Item with UID '{itemUID}' borrowed successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ReturnItem")]
        public IActionResult ReturnItem(string itemUID)
        {
            try
            {
                _inventoryRepo.ReturnItem(itemUID);
                return Ok($"Item with UID '{itemUID}' returned successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("UpdateItemViaUid")]
        public async Task<ActionResult> UpdateItemViaUid([FromBody] InventoryDataModel updatedItem)
        {
            if (updatedItem == null)
            {
                return BadRequest("Invalid data provided");
            }

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

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
                loc_id = @loc_id
            WHERE 
                item_uid = @old_item_uid"; // Use the old item UID to locate the record

                var parameters = new
                {
                    item_uid = updatedItem.item_uid, // Updated UID
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
                    invTime = updatedItem.invTime,
                    invBy = updatedItem.invBy,
                    loc_id = updatedItem.loc_id
                };

                var affectedRows = await connection.ExecuteAsync(sql, parameters);

                if (affectedRows > 0)
                {
                    return Ok("Item updated successfully");
                }
                else
                {
                    return NotFound("Item not found");
                }
            }
        }

    }
}
