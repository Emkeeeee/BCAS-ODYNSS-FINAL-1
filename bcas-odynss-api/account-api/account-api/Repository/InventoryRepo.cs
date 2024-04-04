using account_api.Models;
using Dapper;
using Microsoft.SqlServer.Server;
using System.Data;
using System.Data.SqlClient;
using System.Security.Principal;

namespace account_api.Repository
{
    public class InventoryRepo
    {
        private readonly string _connectionString;

        public InventoryRepo(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<int> AddItemAsync(InventoryModel item)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Query to get the latest item_uid for the same item_name and item_desc
                string latestUidQuery = @"
            SELECT TOP 1 item_uid 
            FROM Items 
            WHERE item_name = @item_name 
            AND item_desc = @item_desc 
            ORDER BY item_uid DESC;";

                // Execute the query
                string latestUid = await connection.ExecuteScalarAsync<string>(latestUidQuery, new
                {
                    item_name = item.itemName,
                    item_desc = item.itemDesc
                });

                int nextUidNumericPart = 1; // Default value if no previous records found

                // If there's a latestUid, extract the numeric part and increment it
                if (!string.IsNullOrEmpty(latestUid))
                {
                    // Extract the numeric part
                    string numericPart = latestUid.Substring(latestUid.LastIndexOf('_') + 1);

                    // Increment the numeric part
                    if (int.TryParse(numericPart, out int parsedNumericPart))
                    {
                        nextUidNumericPart = parsedNumericPart + 1;
                    }
                }

                // Format the nextUid with leading zeros
                string nextUid = $"_{nextUidNumericPart:D5}";

                string sql = @"
            INSERT INTO Items (item_uid, item_name, item_desc, remarks, dept_id, cat_id, subCat_id, unqFeat_id, unqFeat, invBy, invTime, borrowBy, loc_id, isOut, isBroken, isActive)
            VALUES (@item_uid, @item_name, @item_desc, @remark, @dept_id, @cat_id, @subCat_id, @unqFeat_id, @unqFeat, @invBy, @invTime, @borrowBy, @loc_id, @IsOut, @IsBroken, @IsActive);
            SELECT SCOPE_IDENTITY();";

                return await connection.ExecuteScalarAsync<int>(sql, new
                {
                    item_uid = item.itemUid + nextUid,
                    item_name = item.itemName,
                    item_desc = item.itemDesc,
                    remark = item.remarks,
                    dept_id = item.deptId,
                    cat_id = item.catId,
                    subCat_id = item.subCatId,
                    unqFeat_id = item.unqFeatId,
                    unqFeat = item.unqFeature,
                    invBy = item.invBy,
                    invTime = DateTime.Now,
                    borrowBy = "N/A",
                    loc_id = item.locId,
                    IsOut = 0,
                    IsBroken = 0,
                    IsActive = 1
                });
            }
        }

        public void DeactivateItem(string itemUID)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Items SET isActive = 0 WHERE item_uid = @ItemUID";
                db.Execute(sql, new { ItemUID = itemUID });
            }
        }

        public void ActivateItem(string itemUID)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Items SET isActive = 0 WHERE item_uid = @ItemUID";
                db.Execute(sql, new { ItemUID = itemUID });
            }
        }

        public void BorrowItem(string itemUID, string borrower, int locId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Items SET borrowBy = @Borrower, loc_id = @Location, isOut = 1 WHERE item_uid = @ItemUID;";
                db.Execute(sql, new { ItemUID = itemUID, Borrower = borrower, Location = locId });
            }
        }

        public void ReturnItem(string itemUID)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Items SET borrowBy = 'N/A', isOut = 0 WHERE item_uid = @ItemUID;";
                db.Execute(sql, new { ItemUID = itemUID});
            }
        }
    }
}
