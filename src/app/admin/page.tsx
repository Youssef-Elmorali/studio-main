import { Megaphone } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Megaphone className="mr-2 h-5 w-5" />
              Urgent Needs
            </CardTitle>
            <CardDescription>Manage urgent blood requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/urgent-needs">Manage Urgent Needs</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Add more admin cards here */}
      </div>
    </div>
  );
} 