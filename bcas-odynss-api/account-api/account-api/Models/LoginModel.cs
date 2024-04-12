namespace account_api.Models
{
    public class LoginModel
    {
        public int user_id { get; set; }
        public string username { get; set; }
        public string password { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public int department { get; set; }
        public bool isAdmin { get; set; }
        public string salt { get; set; }
    }
}
