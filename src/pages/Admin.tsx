import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const companies = [
  { id: '1', name: 'Acme Corp', status: 'Active', users: 12, plan: 'Enterprise', joined: 'Oct 12, 2025' },
  { id: '2', name: 'Globex Inc', status: 'Pending', users: 1, plan: 'Pro', joined: 'Oct 15, 2025' },
  { id: '3', name: 'Initech', status: 'Suspended', users: 4, plan: 'Basic', joined: 'Sep 01, 2025' },
]

export function Admin() {
  const { user } = useAuthStore()

  if (user?.role !== 'Super Admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Super Admin</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage platform companies and approvals.
          </p>
        </div>
        <Button>Whitelist New Domain</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124.5k</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Companies</CardTitle>
          <CardDescription>View and manage all registered companies.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      company.status === 'Active' ? 'default' : 
                      company.status === 'Pending' ? 'secondary' : 'destructive'
                    }>
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.users}</TableCell>
                  <TableCell>{company.plan}</TableCell>
                  <TableCell className="text-zinc-500">{company.joined}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {company.status === 'Pending' && (
                      <Button variant="outline" size="sm">Approve</Button>
                    )}
                    {company.status === 'Active' && (
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">Suspend</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
