import { getUserData } from "@/utils/getUserData";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, ClipboardList, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const user = await getUserData();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user.user_metadata.full_name} - {user.role_name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <QuickActionCard
          title="Create Practice Plan"
          icon={<ClipboardList className="h-6 w-6" />}
          href="/practice-plans/create"
        />
        <QuickActionCard
          title="Manage Drills"
          icon={<Users className="h-6 w-6" />}
          href="/drills"
        />
        {/* <QuickActionCard
          title="View Team Roster"
          icon={<Users className="h-6 w-6" />}
          href="/team-roster"
        /> */}
        {/* <QuickActionCard
          title="Upcoming Events"
          icon={<CalendarDays className="h-6 w-6" />}
          href="/events"
        /> */}
        {/* <QuickActionCard
          title="Performance Metrics"
          icon={<Award className="h-6 w-6" />}
          href="/metrics"
        /> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Team: {user.team_name || 'Not assigned to a team'}</p>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/team-details">View Team Details</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickActionCard({ title, icon, href }: { title: string, icon: React.ReactNode, href: string }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        <Button asChild variant="outline" className="w-full">
          <Link href={href}>Go to {title}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
