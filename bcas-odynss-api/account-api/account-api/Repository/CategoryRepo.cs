using System.Data.SqlClient;
using System.Data;
using Dapper;
using account_api.Models;

namespace account_api.Repository
{
    public class CategoryRepo
    {
        private readonly string _connectionString;

        public CategoryRepo(string connectionString)
        {
            _connectionString = connectionString;
        }

        //Department
        public void DeactivateDepartment(int deptId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Get department name for logging
                string departmentName = db.QuerySingleOrDefault<string>("SELECT department FROM Department WHERE dept_id = @DeptId", new { DeptId = deptId });

                string sql = "UPDATE Department SET isActive = 0 WHERE dept_id = @DeptId";
                db.Execute(sql, new { DeptId = deptId });

                // Log the deactivation action
                LogCategoryAction(creatorId, departmentName, "Deactivated Department", DateTime.Now);
            }
        }

        public void ActivateDepartment(int deptId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Get department name for logging
                string departmentName = db.QuerySingleOrDefault<string>("SELECT department FROM Department WHERE dept_id = @DeptId", new { DeptId = deptId });

                string sql = "UPDATE Department SET isActive = 1 WHERE dept_id = @DeptId";
                db.Execute(sql, new { DeptId = deptId });

                // Log the activation action
                LogCategoryAction(creatorId, departmentName, "Activated Department", DateTime.Now);
            }
        }

        public void EditDepartment(int deptId, string deptName, string acronym, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Get department name for logging
                string departmentName = db.QuerySingleOrDefault<string>("SELECT department FROM Department WHERE dept_id = @DeptId", new { DeptId = deptId });

                string sql = "UPDATE Department SET department = @DeptName, acronym = @Acronym WHERE dept_id = @DeptId";
                db.Execute(sql, new { DeptId = deptId, DeptName = deptName, Acronym = acronym });

                // Log the edit action
                LogCategoryAction(creatorId, departmentName, "Edit Department", DateTime.Now);
            }
        }

        public void AddDepartment(Department department, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string checkIfExistsQuery = "SELECT COUNT(*) FROM Department WHERE department = @Department OR acronym = @Acronym";
                int count = db.QuerySingle<int>(checkIfExistsQuery, department);

                if (count > 0)
                {
                    throw new InvalidOperationException("Department already exists.");
                }

                string insertQuery = "INSERT INTO Department (department, acronym, isActive) VALUES (@Department, @Acronym, 1)";
                db.Execute(insertQuery, department);

                // Log the addition action
                LogCategoryAction(creatorId, department.department, "Add Department", DateTime.Now);
            }
        }

        private void LogCategoryAction(int creatorId, string value, string action, DateTime time)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "INSERT INTO CategoryLogs (creator_id, value, action, time) VALUES (@CreatorId, @Value, @Action, @Time)";
                db.Execute(sql, new { CreatorId = creatorId, Value = value, Action = action, Time = time });
            }
        }

        public List<CategoryLogModel> GetCategoryLogs()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                string sql = @"SELECT 
                                cl.catlog_id, 
                                u.firstname + ' ' + u.lastname AS admin,
                                cl.value,
                                cl.action, 
                                FORMAT(cl.[time], 'dd-MM-yyyy hh:mm:ss tt') AS formatted_time
                            FROM 
                                CategoryLogs cl
                            LEFT JOIN
                                Users u ON cl.creator_id = u.user_id";

                return connection.Query<CategoryLogModel>(sql).ToList();
            }
        }

        //-----------------------------------------------------------------------------------------------------------------------------

        //Category

        public void DeactivateCategory(int catId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Update category isActive status
                string sql = "UPDATE Category SET isActive = 0 WHERE cat_id = @CatId";
                db.Execute(sql, new { CatId = catId });

                // Log the deactivation action
                LogCategoryAction(creatorId, catId, "Deactivate Category", DateTime.Now);
            }
        }

        public void ActivateCategory(int catId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Update category isActive status
                string sql = "UPDATE Category SET isActive = 1 WHERE cat_id = @CatId";
                db.Execute(sql, new { CatId = catId });

                // Log the activation action
                LogCategoryAction(creatorId, catId, "Activate Category", DateTime.Now);
            }
        }

        public void EditCategory(int catId, string catName, string acronym, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Update category details
                string sql = "UPDATE Category SET category = @CatName, acronym = @Acronym WHERE cat_id = @CatId";
                db.Execute(sql, new { CatId = catId, CatName = catName, Acronym = acronym });

                // Log the edit action
                LogCategoryAction(creatorId, catId, "Edit Category", DateTime.Now);
            }
        }

        public void AddCategory(Category category, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Check if category already exists
                string checkIfExistsQuery = "SELECT COUNT(*) FROM Category WHERE category = @Category OR acronym = @Acronym";
                int count = db.QuerySingle<int>(checkIfExistsQuery, category);

                if (count > 0)
                {
                    throw new InvalidOperationException("Category already exists.");
                }

                // Insert new category
                string insertQuery = "INSERT INTO Category (category, acronym, isActive) VALUES (@Category, @Acronym, 1)";
                db.Execute(insertQuery, category);

                // Log the addition action
                LogCategoryAction(creatorId, category.category, "Added Category", DateTime.Now);
            }
        }

        private void LogCategoryAction(int creatorId, int catId, string action, DateTime time)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string value = db.QuerySingleOrDefault<string>("SELECT category FROM Category WHERE cat_id = @CatId", new { CatId = catId });

                string sql = "INSERT INTO CategoryLogs (creator_id, value, action, time) VALUES (@CreatorId, @Value, @Action, @Time)";
                db.Execute(sql, new { CreatorId = creatorId, Value = value, Action = action, Time = time });
            }
        }

        //-----------------------------------------------------------------------------------------------------------------------------

        // Item Subcategory

        public void DeactivateSubcategory(int subCatId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Update subcategory isActive status
                string sql = "UPDATE SubCategory SET isActive = 0 WHERE subCat_id = @SubCatId";
                db.Execute(sql, new { SubCatId = subCatId });

                // Get subcategory name for logging
                string subCatName = db.QuerySingleOrDefault<string>("SELECT subCategory FROM SubCategory WHERE subCat_id = @SubCatId", new { SubCatId = subCatId });

                // Log the deactivation action
                LogCategorySubCatAction(creatorId, subCatName, "Deactivate Subcategory", DateTime.Now);
            }
        }

        public void ActivateSubcategory(int subCatId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Update subcategory isActive status
                string sql = "UPDATE SubCategory SET isActive = 1 WHERE subCat_id = @SubCatId";
                db.Execute(sql, new { SubCatId = subCatId });

                // Get subcategory name for logging
                string subCatName = db.QuerySingleOrDefault<string>("SELECT subCategory FROM SubCategory WHERE subCat_id = @SubCatId", new { SubCatId = subCatId });

                // Log the activation action
                LogCategorySubCatAction(creatorId, subCatName, "Activate Subcategory", DateTime.Now);
            }
        }

        public void EditSubcategory(int subCatId, string subCatName, string acronym, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Update subcategory details
                string sql = "UPDATE SubCategory SET subCategory = @SubCatName, acronym = @Acronym WHERE subCat_id = @SubCatId";
                db.Execute(sql, new { SubCatId = subCatId, SubCatName = subCatName, Acronym = acronym });

                // Log the edit action
                LogCategorySubCatAction(creatorId, subCatName, "Edit Subcategory", DateTime.Now);
            }
        }

        public void AddSubcategory(SubCategory subCategory, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                // Check if subcategory already exists
                string checkIfExistsQuery = "SELECT COUNT(*) FROM SubCategory WHERE subCategory = @SubCategory OR acronym = @Acronym";
                int count = db.QuerySingle<int>(checkIfExistsQuery, subCategory);

                if (count > 0)
                {
                    throw new InvalidOperationException("Subcategory already exists.");
                }

                // Insert new subcategory
                string insertQuery = "INSERT INTO SubCategory (cat_id, subCategory, acronym, isActive) VALUES (@cat_id, @SubCategory, @Acronym, 1)";
                db.Execute(insertQuery, subCategory);

                // Log the addition action
                LogCategorySubCatAction(creatorId, subCategory.subCategory, "Add Subcategory", DateTime.Now);
            }
        }

        private void LogCategorySubCatAction(int creatorId, string value, string action, DateTime time)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "INSERT INTO CategoryLogs (creator_id, value, action, time) VALUES (@CreatorId, @Value, @Action, @Time)";
                db.Execute(sql, new { CreatorId = creatorId, Value = value, Action = action, Time = time });
            }
        }



        //-----------------------------------------------------------------------------------------------------------------------------

        // Unique Feature
        public void DeactivateUniqueFeature(int unqFeatId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string uniqueFeatureName = db.QuerySingleOrDefault<string>("SELECT unqFeature FROM UniqueFeature WHERE unqFeat_id = @UnqFeatId", new { UnqFeatId = unqFeatId });

                string sql = "UPDATE UniqueFeature SET isActive = 0 WHERE unqFeat_id = @UnqFeatId";
                db.Execute(sql, new { UnqFeatId = unqFeatId });

                // Log the deactivation action
                LogCategoryUnqFeatAction(creatorId, uniqueFeatureName, "Deactivate Unique Feature", DateTime.Now);
            }
        }

        public void ActivateUniqueFeature(int unqFeatId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string uniqueFeatureName = db.QuerySingleOrDefault<string>("SELECT unqFeature FROM UniqueFeature WHERE unqFeat_id = @UnqFeatId", new { UnqFeatId = unqFeatId });

                string sql = "UPDATE UniqueFeature SET isActive = 1 WHERE unqFeat_id = @UnqFeatId";
                db.Execute(sql, new { UnqFeatId = unqFeatId });

                // Log the activation action
                LogCategoryUnqFeatAction(creatorId, uniqueFeatureName, "Activate Unique Feature", DateTime.Now);
            }
        }

        public void EditUniqueFeature(int unqFeatId, string unqFeatName, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE UniqueFeature SET unqFeature = @UnqFeat WHERE unqFeat_id = @UnqFeatId";
                db.Execute(sql, new { UnqFeatId = unqFeatId, UnqFeat = unqFeatName });

                // Log the edit action
                LogCategoryUnqFeatAction(creatorId, unqFeatName, "Edit Unique Feature", DateTime.Now);
            }
        }

        public void AddUniqueFeature(UniqueFeature uniqueFeature, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string checkIfExistsQuery = "SELECT COUNT(*) FROM UniqueFeature WHERE unqFeature = @UnqFeature";
                int count = db.QuerySingle<int>(checkIfExistsQuery, uniqueFeature);

                if (count > 0)
                {
                    throw new InvalidOperationException("Unique Feature already exists.");
                }

                string insertQuery = "INSERT INTO UniqueFeature (unqFeature, isActive) VALUES (@UnqFeature, 1)";
                db.Execute(insertQuery, uniqueFeature);

                // Log the addition action
                LogCategoryUnqFeatAction(creatorId, uniqueFeature.unqFeature, "Add Unique Feature", DateTime.Now);
            }
        }

        private void LogCategoryUnqFeatAction(int creatorId, string value, string action, DateTime time)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "INSERT INTO CategoryLogs (creator_id, value, action, time) VALUES (@CreatorId, @Value, @Action, @Time)";
                db.Execute(sql, new { CreatorId = creatorId, Value = value, Action = action, Time = time });
            }
        }

        //-----------------------------------------------------------------------------------------------------------------------------

        // Unique Feature Value

        public void DeactivateUniqueFeatureValue(int unqFeatVal_id, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string uniqueFeatureValueName = db.QuerySingleOrDefault<string>("SELECT unqFeatVal FROM UniqueFeatureValues WHERE unqFeatVal_id = @UnqFeatValId", new { UnqFeatValId = unqFeatVal_id });

                string sql = "UPDATE UniqueFeatureValues SET isActive = 0 WHERE unqFeatVal_id = @UnqFeatValId";
                db.Execute(sql, new { UnqFeatValId = unqFeatVal_id });

                // Log the deactivation action
                LogCategoryUnqFeatValAction(creatorId, uniqueFeatureValueName, "Deactivate Unique Feature Value", DateTime.Now);
            }
        }

        public void ActivateUniqueFeatureValue(int unqFeatVal_id, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string uniqueFeatureValueName = db.QuerySingleOrDefault<string>("SELECT unqFeatVal FROM UniqueFeatureValues WHERE unqFeatVal_id = @UnqFeatValId", new { UnqFeatValId = unqFeatVal_id });

                string sql = "UPDATE UniqueFeatureValues SET isActive = 1 WHERE unqFeatVal_id = @UnqFeatValId";
                db.Execute(sql, new { UnqFeatValId = unqFeatVal_id });

                // Log the activation action
                LogCategoryUnqFeatValAction(creatorId, uniqueFeatureValueName, "Activate Unique Feature Value", DateTime.Now);
            }
        }

        public void EditUniqueFeatureValue(int unqFeatVal_id, string unqFeatValName, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE UniqueFeatureValues SET unqFeatVal = @UnqFeatValName WHERE unqFeatVal_id = @UnqFeatValId";
                db.Execute(sql, new { UnqFeatValId = unqFeatVal_id, UnqFeatValName = unqFeatValName });

                // Log the edit action
                LogCategoryUnqFeatValAction(creatorId, unqFeatValName, "Edit Unique Feature Value", DateTime.Now);
            }
        }

        public void AddUniqueFeatureValue(UniqueFeatureValue uniqueFeatureValue, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string checkIfExistsQuery = "SELECT COUNT(*) FROM UniqueFeatureValues WHERE unqFeatVal = @UnqFeatVal";
                int count = db.QuerySingle<int>(checkIfExistsQuery, uniqueFeatureValue);

                if (count > 0)
                {
                    throw new InvalidOperationException("Unique Feature Value already exists.");
                }

                string insertQuery = "INSERT INTO UniqueFeatureValues (unqFeat_id, unqFeatVal, isActive) VALUES (@unqFeat_id, @unqFeatVal, 1)";
                db.Execute(insertQuery, uniqueFeatureValue);

                // Log the addition action
                LogCategoryUnqFeatValAction(creatorId, uniqueFeatureValue.unqFeatVal, "Add Unique Feature Value", DateTime.Now);
            }
        }

        private void LogCategoryUnqFeatValAction(int creatorId, string value, string action, DateTime time)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "INSERT INTO CategoryLogs (creator_id, value, action, time) VALUES (@CreatorId, @Value, @Action, @Time)";
                db.Execute(sql, new { CreatorId = creatorId, Value = value, Action = action, Time = time });
            }
        }

        //-----------------------------------------------------------------------------------------------------------------------------

        // Location

        public void DeactivateLocation(int locId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string locationName = db.QuerySingleOrDefault<string>("SELECT location FROM Location WHERE loc_id = @LocId", new { LocId = locId });

                string sql = "UPDATE Location SET isActive = 0 WHERE loc_id = @LocId";
                db.Execute(sql, new { LocId = locId });

                // Log the deactivation action
                LogCategoryLocationAction(creatorId, locationName, "Deactivate", DateTime.Now);
            }
        }

        public void ActivateLocation(int locId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string locationName = db.QuerySingleOrDefault<string>("SELECT location FROM Location WHERE loc_id = @LocId", new { LocId = locId });

                string sql = "UPDATE Location SET isActive = 1 WHERE loc_id = @LocId";
                db.Execute(sql, new { LocId = locId });

                // Log the activation action
                LogCategoryLocationAction(creatorId, locationName, "Activate", DateTime.Now);
            }
        }

        public void EditLocation(int locId, string locName, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Location SET location = @LocName WHERE loc_id = @LocId";
                db.Execute(sql, new { LocId = locId, LocName = locName });

                // Log the edit action
                LogCategoryLocationAction(creatorId, locName, "Edit", DateTime.Now);
            }
        }

        public void AddLocation(Location location, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string checkIfExistsQuery = "SELECT COUNT(*) FROM Location WHERE location = @Location";
                int count = db.QuerySingle<int>(checkIfExistsQuery, location);

                if (count > 0)
                {
                    throw new InvalidOperationException("Location already exists.");
                }

                string insertQuery = "INSERT INTO Location (location, isActive) VALUES (@Location, 1)";
                db.Execute(insertQuery, location);

                // Log the addition action
                LogCategoryLocationAction(creatorId, location.location, "Add", DateTime.Now);
            }
        }

        private void LogCategoryLocationAction(int creatorId, string value, string action, DateTime time)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "INSERT INTO CategoryLogs (creator_id, value, action, time) VALUES (@CreatorId, @Value, @Action, @Time)";
                db.Execute(sql, new { CreatorId = creatorId, Value = value, Action = action, Time = time });
            }
        }
    }
}
