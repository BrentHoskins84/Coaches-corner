import { createClient } from "@/utils/supabase/server";
import { UserProfile, Role, Team } from "@/types/database";

export async function getUserData() {
    const supabase = await createClient();

    // Get the user from Supabase auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error('Error fetching user:', userError);
        return null;
    }

    // Fetch user's profile with role and team information
    const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
        *,
        roles:role_id(id, name),
        teams:team_id(id, name)
        `)
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Error fetching user profile:', profileError);
    }

    // Combine user data with profile information
    const enhancedUser = {
        ...user,
        role_id: userProfile?.role_id || null,
        role_name: userProfile?.roles?.name || 'No Role Assigned',
        team_id: userProfile?.team_id || null,
        team_name: userProfile?.teams?.name || 'No Team Assigned',
        is_approved: userProfile?.is_approved || false
    };

    return enhancedUser;
}

export async function getUserFullName(userId: string) {
    try {
        const supabase = await createClient();

        // Call the RPC function to get the user's full name
        const { data, error } = await supabase
            .rpc('get_user_full_name', {
                user_id: userId
            });

        if (error) {
            console.error('Error fetching user full name:', error);
            return 'Unknown User';
        }

        return data || 'Unknown User';
    } catch (error) {
        console.error('Error getting user full name:', error);
        return 'Unknown User';
    }
}
