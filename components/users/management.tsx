'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

type User = {
  id: string
  email: string
  role_id: number
  team_id: string | null
  is_approved: boolean
}

type Role = {
  id: number
  name: string
}

type Team = {
  id: string
  name: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState('')
  const [newUserTeam, setNewUserTeam] = useState('none')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchTeams()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
    if (error) {
      console.error('Error fetching users:', error)
    } else {
      setUsers(data)
    }
  }

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
    if (error) {
      console.error('Error fetching roles:', error)
    } else {
      setRoles(data)
    }
  }

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
    if (error) {
      console.error('Error fetching teams:', error)
    } else {
      setTeams(data)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserEmail || !newUserRole) return

    const teamId = newUserTeam === 'none' ? null : newUserTeam

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          roleId: parseInt(newUserRole),
          teamId: teamId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      const data = await response.json()

      setUsers([...users, {
        id: data.user.id,
        email: data.user.email,
        role_id: parseInt(newUserRole),
        team_id: teamId,
        is_approved: true
      }])
      setNewUserEmail('')
      setNewUserRole('')
      setNewUserTeam('none')
      toast({
        title: "Success",
        description: "User created successfully.",
      })
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } else {
      fetchUsers()
      toast({
        title: "Success",
        description: "User updated successfully.",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      setUsers(users.filter(user => user.id !== userId))
      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <form onSubmit={handleCreateUser}>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="Enter user email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
            <Select value={newUserRole} onValueChange={setNewUserRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newUserTeam} onValueChange={setNewUserTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Select user team (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Button type="submit">Create User</Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-4">
        {users.map(user => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.email}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={user.role_id ? user.role_id.toString() : ""}
                onValueChange={(value) => handleUpdateUser(user.id, { role_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={user.team_id || 'none'}
                onValueChange={(value) => handleUpdateUser(user.id, { team_id: value === 'none' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No team</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <span>Approved:</span>
                <input
                  type="checkbox"
                  checked={user.is_approved}
                  onChange={(e) => handleUpdateUser(user.id, { is_approved: e.target.checked })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>Delete User</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
