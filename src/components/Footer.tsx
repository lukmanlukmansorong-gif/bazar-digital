export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bazar Digital. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Bantuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
