using account_api.Models;
using account_api.Repository;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;

namespace account_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly CategoryRepo _categoryRepo;

        public CategoryController(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = configuration.GetConnectionString("InventoryConnection");
            _categoryRepo = new CategoryRepo(_connectionString);
        }

        // Department Category

        [HttpGet("GetDeactDepartments")]
        public async Task<ActionResult<IEnumerable<Department>>> GetDeactDepartments()
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
                        isActive = 0;";


                var departments = await connection.QueryAsync<Department>(sql);

                return Ok(departments);
            }
        }

        [HttpGet("GetDepartments")]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments(int deptId)
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
                        isActive = 1
                        AND dept_id = @DeptId;";

                var departments = await connection.QueryAsync<Department>(sql, new {DeptId = deptId});

                return Ok(departments);
            }
        }

        [HttpPut("DeactivateDepartment")]
        public IActionResult DeactivateDepartment(int deptId)
        {
            try
            {
                _categoryRepo.DeactivateDepartment(deptId);
                return Ok($"'{deptId}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        [HttpPut("ActivateDepartment")]
        public IActionResult ActivateDepartment(int deptId)
        {
            try
            {
                _categoryRepo.ActivateDepartment(deptId);
                return Ok($"'{deptId}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("EditDepartment")]
        public IActionResult EditDepartment([FromBody] DepartmentEditModel model)
        {
            try
            {
                _categoryRepo.EditDepartment(model.DeptId, model.DeptName, model.Acronym);
                return Ok($"{model.DeptId} edited successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("AddDepartment")]
        public IActionResult AddDepartment([FromBody] DeptAdd model)
        {
            if (model == null)
            {
                return BadRequest("Department object is null");
            }

            var department = new Department
            {
                department = model.department,
                acronym = model.acronym
                // you may add more properties here if necessary
            };

            try
            {
                _categoryRepo.AddDepartment(department);
                return Ok("Department added successfully");
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // Conflict status code (409) indicates that the request could not be completed due to a conflict with the current state of the resource.
            }
        }

        //--------------------------------------------------------------------------------------------------------------------------------------------------------

        //Item Subcategory

        [HttpGet("GetDeactSubCategory")]
        public async Task<ActionResult<IEnumerable<SubCategory>>> GetSubCategory(int catId)
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
                    sc.isActive = 0
                    AND sc.cat_id = @CatId;";

                var subCategory = await connection.QueryAsync<SubCategory>(sql, new { CatId = catId });

                return Ok(subCategory);
            }
        }

        [HttpGet("GetSubcategoryViaUid")]
        public async Task<ActionResult<IEnumerable<SubCategory>>> GetSubcategoryViaUid(int catId, int subCatId)
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
                    AND sc.cat_id = @CatId
                    AND sc.subCat_id = @SubCatId;";

                var subcategory = await connection.QueryAsync<SubCategory>(sql, new { CatId = catId, SubCatId = subCatId});

                return Ok(subcategory);
            }
        }

        [HttpPut("DeactivateSubcategory")]
        public IActionResult DeactivateSubcategory(int subCatId)
        {
            try
            {
                _categoryRepo.DeactivateSubcategory(subCatId);
                return Ok($"'{subCatId}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ActivateSubcategory")]
        public IActionResult ActivateSubcategory(int subCatId)
        {
            try
            {
                _categoryRepo.ActivateSubcategory(subCatId);
                return Ok($"'{subCatId}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("EditSubcategory")]
        public IActionResult EditSubcategory([FromBody] SubcategoryEditModel model)
        {
            try
            {
                _categoryRepo.EditSubcategory(model.SubCatId, model.SubCatName, model.Acronym);
                return Ok($"{model.SubCatId} edited successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("AddSubcategory")]
        public IActionResult AddSubcategory([FromBody] SubCatAdd model)
        {
            if (model == null)
            {
                return BadRequest("Category object is null");
            }

            var subCategory = new SubCategory
            {
                cat_id = int.Parse(model.cat_id),
                subCategory = model.subCategory,
                acronym = model.acronym
                // you may add more properties here if necessary
            };

            try
            {
                _categoryRepo.AddSubcategory(subCategory);
                return Ok("Department added successfully");
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // Conflict status code (409) indicates that the request could not be completed due to a conflict with the current state of the resource.
            }
        }

        //--------------------------------------------------------------------------------------------------------------------------------------------------------

        //Item Category

        [HttpGet("GetDeactCategory")]
        public async Task<ActionResult<IEnumerable<Category>>> GetDeactCategory()
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
                        isActive = 0;";

                var category = await connection.QueryAsync<Category>(sql);

                return Ok(category);
            }
        }

        [HttpGet("GetCategoryViaUid")]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategoryViaUid(int catId)
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
                        isActive = 1
                        AND cat_id = @CatId;";

                var category = await connection.QueryAsync<Category>(sql, new { CatId = catId });

                return Ok(category);
            }
        }

        [HttpPut("DeactivateCategory")]
        public IActionResult DeactivateCategory(int catId)
        {
            try
            {
                _categoryRepo.DeactivateCategory(catId);
                return Ok($"'{catId}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ActivateCategory")]
        public IActionResult ActivateCategory(int catId)
        {
            try
            {
                _categoryRepo.ActivateCategory(catId);
                return Ok($"'{catId}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("EditCategory")]
        public IActionResult EditCategory([FromBody] CategoryEditModel model)
        {
            try
            {
                _categoryRepo.EditCategory(model.CatId, model.CatName, model.Acronym);
                return Ok($"{model.CatId} edited successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("AddCategory")]
        public IActionResult AddCategory([FromBody] CatAdd model)
        {
            if (model == null)
            {
                return BadRequest("Category object is null");
            }

            var category = new Category
            {
                category = model.category,
                acronym = model.acronym
                // you may add more properties here if necessary
            };

            try
            {
                _categoryRepo.AddCategory(category);
                return Ok("Department added successfully");
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // Conflict status code (409) indicates that the request could not be completed due to a conflict with the current state of the resource.
            }
        }

        //--------------------------------------------------------------------------------------------------------------------------------------------------------

        //Item Location

        [HttpGet("GetDeactLocation")]
        public async Task<ActionResult<IEnumerable<Location>>> GetDeactLocation()
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
                        isActive = 0;";

                var location = await connection.QueryAsync<Location>(sql);

                return Ok(location);
            }
        }

        [HttpGet("GetLocationViaUid")]
        public async Task<ActionResult<IEnumerable<Location>>> GetLocationViaUid(int locId)
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
                        isActive = 1
                        AND loc_id = @LocId;";

                var location = await connection.QueryAsync<Location>(sql, new { LocId = locId });

                return Ok(location);
            }
        }



        [HttpPut("DeactivateLocation")]
        public IActionResult DeactivateLocation(int locId)
        {
            try
            {
                _categoryRepo.DeactivateLocation(locId);
                return Ok($"'{locId}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        [HttpPut("ActivateLocation")]
        public IActionResult ActivateLocation(int locId)
        {
            try
            {
                _categoryRepo.ActivateLocation(locId);
                return Ok($"'{locId}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("EditLocation")]
        public IActionResult EditLocation([FromBody] LocationEditModel model)
        {
            try
            {
                _categoryRepo.EditLocation(model.LocId, model.LocName);
                return Ok($"{model.LocId} edited successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("AddLocation")]
        public IActionResult AddLocation([FromBody] LocAdd model)
        {
            if (model == null)
            {
                return BadRequest("Department object is null");
            }

            var location = new Location
            {
                location = model.location
            };

            try
            {
                _categoryRepo.AddLocation(location);
                return Ok("Location added successfully");
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // Conflict status code (409) indicates that the request could not be completed due to a conflict with the current state of the resource.
            }
        }

        //--------------------------------------------------------------------------------------------------------------------------------------------------------

        //Item Unique Feature

        [HttpGet("GetDeactUniqueFeature")]
        public async Task<ActionResult<IEnumerable<UniqueFeature>>> GetDeactUniqueFeature()
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
                        isActive = 0;";

                var uf = await connection.QueryAsync<UniqueFeature>(sql);

                return Ok(uf);
            }
        }

        [HttpGet("GetUniqueFeatureViaUid")]
        public async Task<ActionResult<IEnumerable<UniqueFeature>>> GetUniqueFeatureViaUid(int unqFeatId)
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
                        isActive = 1
                        AND unqFeat_id = @UnqFeatId;";

                var uniqueFeature = await connection.QueryAsync<UniqueFeature>(sql, new { UnqFeatId = unqFeatId });

                return Ok(uniqueFeature);
            }
        }



        [HttpPut("DeactivateUniqueFeature")]
        public IActionResult DeactivateUniqueFeature(int unqFeatId)
        {
            try
            {
                _categoryRepo.DeactivateUniqueFeature(unqFeatId);
                return Ok($"'{unqFeatId}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        [HttpPut("ActivateUniqueFeature")]
        public IActionResult ActivateUniqueFeature(int unqFeatId)
        {
            try
            {
                _categoryRepo.ActivateUniqueFeature(unqFeatId);
                return Ok($"'{unqFeatId}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("EditUniqueFeature")]
        public IActionResult EditUniqueFeature([FromBody] UniqueFeatureEditModel model)
        {
            try
            {
                _categoryRepo.EditUniqueFeature(model.UnqFeatId, model.UnqFeatName);
                return Ok($"{model.UnqFeatId} edited successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("AddUniqueFeature")]
        public IActionResult AddUniqueFeature([FromBody] UnqFeatAdd model)
        {
            if (model == null)
            {
                return BadRequest("Category object is null");
            }

            var unqFeature = new UniqueFeature
            {
                unqFeature = model.unqFeature,
                // you may add more properties here if necessary
            };

            try
            {
                _categoryRepo.AddUniqueFeature(unqFeature);
                return Ok("Unique Feature added successfully");
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // Conflict status code (409) indicates that the request could not be completed due to a conflict with the current state of the resource.
            }
        }

        //--------------------------------------------------------------------------------------------------------------------------------------------------------

        //Item Unique Feature Value

        [HttpGet("GetDeactUniqueFeatureValue")]
        public async Task<ActionResult<IEnumerable<Department>>> GetUniqueFeatureValue(int unqFeat_id)
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
                        AND ufv.isActive = 0;";

                var ufv = await connection.QueryAsync<UniqueFeatureValue>(sql, new { unqFeat_id });

                return Ok(ufv);
            }
        }

        [HttpGet("GetUniqueFeatureValueViaUid")]
        public async Task<ActionResult<IEnumerable<UniqueFeatureValue>>> GetUniqueFeatureValueViaUid(int unqFeat_id, int unqFeatVal_id)
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
                        ufv.unqFeat_id = @UnqFeatId
                        AND ufv.unqFeatVal_id = @UnqFeatValId
                        AND ufv.isActive = 1;";

                var unqFeatVal = await connection.QueryAsync<UniqueFeatureValue>(sql, new { UnqFeatId = unqFeat_id, UnqFeatValId = unqFeatVal_id });

                return Ok(unqFeatVal);
            }
        }

        [HttpPut("DeactivateUniqueFeatureValue")]
        public IActionResult DeactivateUniqueFeatureValue(int unqFeatVal_id)
        {
            try
            {
                _categoryRepo.DeactivateUniqueFeatureValue(unqFeatVal_id);
                return Ok($"'{unqFeatVal_id}' deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ActivateUniqueFeatureValue")]
        public IActionResult ActivateUniqueFeatureValue(int unqFeatVal_id)
        {
            try
            {
                _categoryRepo.ActivateUniqueFeatureValue(unqFeatVal_id);
                return Ok($"'{unqFeatVal_id}' activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("EditUniqueFeatureValue")]
        public IActionResult EditUniqueFeatureValue([FromBody] UniqueFeatureValueEditModel model)
        {
            try
            {
                _categoryRepo.EditUniqueFeatureValue(model.UnqFeatValId, model.UnqFeatValName);
                return Ok($"{model.UnqFeatValId} edited successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("AddUniqueFeatureValue")]
        public IActionResult AddUniqueFeatureValue([FromBody] UnqFeatValAdd model)
        {
            if (model == null)
            {
                return BadRequest("Category object is null");
            }

            var unqFeatValue = new UniqueFeatureValue
            {
                unqFeat_id = int.Parse(model.unqFeat_id),
                unqFeatVal = model.unqFeatVal,
                // you may add more properties here if necessary
            };

            try
            {
                _categoryRepo.AddUniqueFeatureValue(unqFeatValue);
                return Ok("Unique Feature Value added successfully");
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // Conflict status code (409) indicates that the request could not be completed due to a conflict with the current state of the resource.
            }
        }
    }
}
