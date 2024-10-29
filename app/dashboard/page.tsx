import { getUserData } from "@/utils/getUserData";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, ClipboardList, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Remove 'use client' directive to make this a Server Component
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <QuickActionCard
          title="Create Practice Plan"
          icon={<ClipboardList className="h-6 w-6" />}
          href="/protected/practice-plan-builder"
        />
        <QuickActionCard
          title="View Team Roster"
          icon={<Users className="h-6 w-6" />}
          href="/team-roster"
        />
        <QuickActionCard
          title="Upcoming Events"
          icon={<CalendarDays className="h-6 w-6" />}
          href="/events"
        />
        <QuickActionCard
          title="Performance Metrics"
          icon={<Award className="h-6 w-6" />}
          href="/metrics"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No recent activity to display.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Team: {user.team_name || 'Not assigned to a team'}</p>
            <Button className="mt-4" asChild>
              <Link href="/team-details">View Team Details</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Keep QuickActionCard as a client component since it has interactivity
function QuickActionCard({ title, icon, href }: { title: string, icon: React.ReactNode, href: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href={href}>Go to {title}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
