// Footer component for bottom of page
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 font-mono text-white p-4 text-center">
      <p>&copy; {currentYear} User Management App. All rights reserved.</p>
    </footer>
  );
}

export default Footer;