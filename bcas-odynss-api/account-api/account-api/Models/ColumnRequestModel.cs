namespace account_api.Models
{
    public class ColumnRequestModel
    {
        public string TableName { get; set; }
        public string ColumnName { get; set; }
        public string DataType { get; set; }
    }
}
