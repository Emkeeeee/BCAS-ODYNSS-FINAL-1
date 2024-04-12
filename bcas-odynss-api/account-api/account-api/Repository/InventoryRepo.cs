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

        public async Task<int> AddItemAsync(InventoryModel item, int creatorId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string deptAcronymSql = "SELECT acronym FROM Department WHERE dept_id = @dept_id";
                string catAcronymSql = "SELECT acronym FROM Category WHERE cat_id = @cat_id";
                string subCatAcronymSql = "SELECT acronym FROM SubCategory WHERE subCat_id = @subCat_id";

                string deptAcronym = await connection.ExecuteScalarAsync<string>(deptAcronymSql, new { dept_id = item.deptId });
                string catAcronym = await connection.ExecuteScalarAsync<string>(catAcronymSql, new { cat_id = item.catId });
                string subCatAcronym = await connection.ExecuteScalarAsync<string>(subCatAcronymSql, new { subCat_id = item.subCatId });

                string itemUid = $"{item.itemName}_{deptAcronym}_{catAcronym}_{subCatAcronym}_{item.unqFeature}";

                string nextUid = Guid.NewGuid().ToString("N").Substring(0, 8);

                string itemLogAction = "Item Added"; // Set the action for item logging

                string itemLogSql = @"
            INSERT INTO ItemLogs (creator_id, action, item_uid, time)
            VALUES (@creator_id, @action, @item_uid, @time);";

                // Insert into ItemLogs table for logging
                await connection.ExecuteAsync(itemLogSql, new
                {
                    creator_id = creatorId,
                    action = itemLogAction,
                    item_uid = itemUid + "_" + nextUid,
                    time = DateTime.Now
                });

                string sql = @"
            INSERT INTO Items (item_uid, item_name, item_desc, remarks, dept_id, cat_id, subCat_id, unqFeat_id, unqFeat, invBy, invTime, borrowBy, loc_id, isOut, isBroken, isActive)
            VALUES (@item_uid, @item_name, @item_desc, @remark, @dept_id, @cat_id, @subCat_id, @unqFeat_id, @unqFeat, @invBy, @invTime, @borrowBy, @loc_id, @IsOut, @IsBroken, @IsActive);
            SELECT SCOPE_IDENTITY();";

                return await connection.ExecuteScalarAsync<int>(sql, new
                {
                    item_uid = itemUid + "_" + nextUid,
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

        public void DeactivateItem(string itemUID, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string updateSql = "UPDATE Items SET isActive = 0 WHERE item_uid = @ItemUID";
                db.Execute(updateSql, new { ItemUID = itemUID });

                string action = "Item Deactivated";
                string logSql = @"
                    INSERT INTO ItemLogs (item_uid, action, time, creator_id)
                    VALUES (@item_uid, @action, @time, @creator_id);";
                db.Execute(logSql, new
                {
                    item_uid = itemUID,
                    action = action,
                    time = DateTime.Now,
                    creator_id = creatorId
                });
            }
        }

        public void ActivateItem(string itemUID, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string updateSql = "UPDATE Items SET isActive = 1 WHERE item_uid = @ItemUID";
                db.Execute(updateSql, new { ItemUID = itemUID });

                string action = "Item Activated";
                string logSql = @"
                    INSERT INTO ItemLogs (item_uid, action, time, creator_id)
                    VALUES (@item_uid, @action, @time, @creator_id);";
                db.Execute(logSql, new
                {
                    item_uid = itemUID,
                    action = action,
                    time = DateTime.Now,
                    creator_id = creatorId
                });
            }
        }

        public void BorrowItem(string itemUID, string borrower, int locId, int userId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                db.Open();
                using (var transaction = db.BeginTransaction())
                {
                    try
                    {
                        // Update Items table to mark the item as borrowed
                        string updateItemsSql = "UPDATE Items SET borrowBy = @Borrower, loc_id = @Location, isOut = 1 WHERE item_uid = @ItemUID;";
                        db.Execute(updateItemsSql, new { ItemUID = itemUID, Borrower = borrower, Location = locId }, transaction);

                        // Insert a record into BorrowHistory table
                        string insertHistorySql = "INSERT INTO BorrowHistory (user_id, item_uid, brw_time, borrower, loc_id, isActive) VALUES (@UserId, @ItemUID, GETDATE(), @Borrower, @Location, 1);";
                        db.Execute(insertHistorySql, new { UserId = userId, ItemUID = itemUID, Borrower = borrower, Location = locId }, transaction);

                        transaction.Commit();
                    }
                    catch (Exception)
                    {
                        // Handle any exceptions
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        public void ReturnItem(string itemUID, int brw_id, int loc_id, bool isBroken)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Update the Items table to mark the item as returned
                string updateItemsSql = "UPDATE Items SET borrowBy = 'N/A', loc_id = @LocId, isBroken = @IsBroken, isOut = 0 WHERE item_uid = @ItemUID;";
                db.Execute(updateItemsSql, new { ItemUID = itemUID, LocId = loc_id, IsBroken = isBroken });

                // Update the BorrowHistory table to mark the corresponding borrowing record as inactive
                string updateBorrowHistorySql = "UPDATE BorrowHistory SET isActive = 0 WHERE brw_id = @BorrowID;";
                db.Execute(updateBorrowHistorySql, new { BorrowID = brw_id });

                // Insert a new record into ReturnHistory table
                string insertReturnHistorySql = "INSERT INTO ReturnHistory (user_id, item_uid, rt_time, borrower, loc_id, isBroken) " +
                                                "VALUES ((SELECT user_id FROM BorrowHistory WHERE brw_id = @BorrowID), " +
                                                "@ItemUID, GETDATE(), " +
                                                "(SELECT borrower FROM BorrowHistory WHERE brw_id = @BorrowID), " +
                                                "@LocId, @IsBroken);";
                db.Execute(insertReturnHistorySql, new { BorrowID = brw_id, ItemUID = itemUID, LocId = loc_id, IsBroken = isBroken });
            }
        }

        public void RestoreItem(string itemUID)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Items SET isActive = 1 WHERE item_uid = @ItemUID";
                db.Execute(sql, new { ItemUID = itemUID });
            }
        }

        public async Task<IEnumerable<ItemLogModel>> GetItemLogs()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sql = @"
                        SELECT 
                            il.itemlog_id,
                            il.item_uid, 
                            u.firstname + ' ' + u.lastname + ' of ' +d.department as dept_handler,
                            il.action, 
                            FORMAT(time, 'dd-MM-yyyy hh:mm:ss tt') AS formatted_time
                        FROM 
                            ItemLogs il
							LEFT JOIN
							Users u ON il.creator_id = u.user_id
							LEFT JOIN
							Department d ON u.department = d.dept_id"; 

                return await connection.QueryAsync<ItemLogModel>(sql);
            }
        }
    }
}
