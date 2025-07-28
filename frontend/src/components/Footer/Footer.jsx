function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 font-mono text-blue-200 py-4 text-center">
      <p className="px-1 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
        &copy; {currentYear} User Management App. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
