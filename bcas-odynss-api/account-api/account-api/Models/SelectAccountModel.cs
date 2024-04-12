namespace account_api.Models
{
    public class SelectAccountModel
    {
        public int user_id { get; set; }
        public string username { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string department { get; set; }
        public string email { get; set; }
        public string formatted_createdAt { get; set; }
        public bool isAdmin { get; set; }
    }
}
