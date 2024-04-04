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
        public void DeactivateDepartment(int deptId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Department SET isActive = 0 WHERE dept_id = @DeptId";
                db.Execute(sql, new { DeptId = deptId });
            }
        }

        public void ActivateDepartment(int deptId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Department SET isActive = 1 WHERE dept_id = @DeptId";
                db.Execute(sql, new { DeptId = deptId });
            }
        }

        public void EditDepartment(int deptId, string deptName, string acronym)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Department SET department = @DeptName, acronym = @Acronym WHERE dept_id = @DeptId";
                db.Execute(sql, new { DeptId = deptId, DeptName = deptName, Acronym = acronym });
            }
        }

        public void AddDepartment(Department department)
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
            }
        }

        //-----------------------------------------------------------------------------------------------------------------------------

        //Category

        public void DeactivateCategory(int catId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Category SET isActive = 0 WHERE cat_id = @CatId";
                db.Execute(sql, new { CatId = catId });
            }
        }

        public void ActivateCategory(int catId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Category SET isActive = 1 WHERE cat_id = @CatId";
                db.Execute(sql, new { CatId = catId });
            }
        }

        public void EditCategory(int catId, string catName, string acronym)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Category SET category = @CatName, acronym = @Acronym WHERE cat_id = @CatId";
                db.Execute(sql, new { CatId = catId, CatName = catName, Acronym = acronym });
            }
        }

        public void AddCategory(Category category)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string checkIfExistsQuery = "SELECT COUNT(*) FROM Category WHERE category = @Category OR acronym = @Acronym";
                int count = db.QuerySingle<int>(checkIfExistsQuery, category);

                if (count > 0)
                {
                    throw new InvalidOperationException("Category already exists.");
                }

                string insertQuery = "INSERT INTO Category (category, acronym, isActive) VALUES (@Category, @Acronym, 1)";
                db.Execute(insertQuery, category);
            }
        }

        //-----------------------------------------------------------------------------------------------------------------------------

        // Item Subcategory

        public void DeactivateSubcategory(int subCatId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE SubCategory SET isActive = 0 WHERE subCat_id = @SubCatId";
                db.Execute(sql, new { SubCatId = subCatId });
            }
        }

        public void ActivateSubcategory(int subCatId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE SubCategory SET isActive = 1 WHERE subCat_id = @SubCatId";
                db.Execute(sql, new { SubCatId = subCatId });
            }
        }

        public void EditSubcategory(int subCatId, string subCatName, string acronym)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE SubCategory SET subCategory = @SubCatName, acronym = @Acronym WHERE subCat_id = @SubCatId";
                db.Execute(sql, new { SubCatId = subCatId, SubCatName = subCatName, Acronym = acronym });
            }
        }

        public void AddSubcategory(SubCategory subCategory)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string checkIfExistsQuery = "SELECT COUNT(*) FROM SubCategory WHERE subCategory = @SubCategory OR acronym = @Acronym";
                int count = db.QuerySingle<int>(checkIfExistsQuery, subCategory);

                if (count > 0)
                {
                    throw new InvalidOperationException("Subcategory already exists.");
                }

                string insertQuery = "INSERT INTO SubCategory (cat_id, subCategory, acronym, isActive) VALUES (@cat_id, @SubCategory, @Acronym, 1)";
                db.Execute(insertQuery, subCategory);
            }
        }


        //-----------------------------------------------------------------------------------------------------------------------------

        // Unique Feature
        public void DeactivateUniqueFeature(int unqFeatId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE UniqueFeature SET isActive = 0 WHERE unqFeat_id = @UnqFeatId";
                db.Execute(sql, new { UnqFeatId = unqFeatId });
            }
        }

        public void ActivateUniqueFeature(int unqFeatId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE UniqueFeature SET isActive = 1 WHERE unqFeat_id = @UnqFeatId";
                db.Execute(sql, new { UnqFeatId = unqFeatId });
            }
        }

        public void EditUniqueFeature(int unqFeatId, string unqFeatName)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE UniqueFeature SET unqFeature = @UnqFeat WHERE unqFeat_id = @UnqFeatId";
                db.Execute(sql, new { UnqFeatId = unqFeatId, UnqFeat = unqFeatName});
            }
        }

        public void AddUniqueFeature(UniqueFeature uniqueFeature)
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
            }
        }

        //-----------------------------------------------------------------------------------------------------------------------------

        // Unique Feature Value

        public void DeactivateUniqueFeatureValue(int unqFeatVal_id)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE UniqueFeatureValues SET isActive = 0 WHERE unqFeatVal_id = @UnqFeatValId";
                db.Execute(sql, new { UnqFeatValId = unqFeatVal_id });
            }
        }

        public void ActivateUniqueFeatureValue(int unqFeatVal_id)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE UniqueFeatureValues SET isActive = 1 WHERE unqFeatVal_id = @UnqFeatValId";
                db.Execute(sql, new { UnqFeatValId = unqFeatVal_id });
            }
        }

        public void EditUniqueFeatureValue(int unqFeatVal_id, string unqFeatValName)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE UniqueFeatureValues SET unqFeatVal = @UnqFeatValName WHERE unqFeatVal_id = @UnqFeatValId";
                db.Execute(sql, new { UnqFeatValId = unqFeatVal_id, UnqFeatValName = unqFeatValName });
            }
        }

        public void AddUniqueFeatureValue(UniqueFeatureValue uniqueFeatureValue)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string checkIfExistsQuery = "SELECT COUNT(*) FROM UniqueFeatureValues WHERE unqFeatVal = @unqFeatVal";
                int count = db.QuerySingle<int>(checkIfExistsQuery, uniqueFeatureValue);

                if (count > 0)
                {
                    throw new InvalidOperationException("Unique Feature Value already exists.");
                }

                string insertQuery = "INSERT INTO UniqueFeatureValues (unqFeat_id, unqFeatVal, isActive) VALUES (@unqFeat_id, @unqFeatVal, 1)";
                db.Execute(insertQuery, uniqueFeatureValue);
            }
        }

        //-----------------------------------------------------------------------------------------------------------------------------

        // Location

        public void DeactivateLocation(int locId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Location SET isActive = 0 WHERE loc_id = @LocId";
                db.Execute(sql, new { LocId = locId });
            }
        }

        public void ActivateLocation(int locId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Location SET isActive = 1 WHERE loc_id = @LocId";
                db.Execute(sql, new { LocId = locId });
            }
        }

        public void EditLocation(int locId, string locName)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Location SET location = @LocName WHERE loc_id = @LocId";
                db.Execute(sql, new { LocId = locId, LocName = locName });
            }
        }

        public void AddLocation(Location location)
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
            }
        }
    }
}
