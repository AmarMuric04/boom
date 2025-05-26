"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, Key, Server } from "lucide-react"

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<"checking" | "success" | "error" | null>(null)
  const [dbData, setDbData] = useState<any>(null)

  const testDatabaseConnection = async () => {
    setDbStatus("checking")
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()

      if (response.ok) {
        setDbStatus("success")
        setDbData(data)
      } else {
        setDbStatus("error")
        setDbData(data)
      }
    } catch (error) {
      setDbStatus("error")
      setDbData({ error: error.message })
    }
  }

  const envVars = [
    { name: "MONGODB_URI", description: "MongoDB connection string", required: true },
    { name: "JWT_SECRET", description: "JWT signing secret", required: true },
    { name: "NODE_ENV", description: "Environment (development/production)", required: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">VideoHub Setup</h1>
          <p className="text-xl text-gray-600">Complete MongoDB integration with authentication system</p>
        </div>

        {/* Environment Variables Check */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Environment Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {envVars.map((envVar) => (
                <div key={envVar.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{envVar.name}</h4>
                    <p className="text-sm text-gray-600">{envVar.description}</p>
                  </div>
                  <Badge variant={envVar.required ? "default" : "secondary"}>
                    {envVar.required ? "Required" : "Optional"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. The environment variables have been added to your Vercel project</li>
                <li>2. MONGODB_URI should point to your MongoDB database</li>
                <li>3. JWT_SECRET should be a secure random string</li>
                <li>4. Test the database connection below</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Database Connection Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testDatabaseConnection} disabled={dbStatus === "checking"}>
                {dbStatus === "checking" ? "Testing Connection..." : "Test Database Connection"}
              </Button>

              {dbStatus && (
                <div
                  className={`p-4 rounded-lg border ${
                    dbStatus === "success"
                      ? "bg-green-50 border-green-200"
                      : dbStatus === "error"
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {dbStatus === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <h4 className="font-medium">
                      {dbStatus === "success" ? "Connection Successful!" : "Connection Failed"}
                    </h4>
                  </div>

                  {dbData && (
                    <div className="mt-4">
                      <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                        {JSON.stringify(dbData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Implemented Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ Authentication System</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• User registration with validation</li>
                  <li>• Secure login with JWT tokens</li>
                  <li>• Password hashing with bcrypt</li>
                  <li>• HTTP-only cookies for security</li>
                  <li>• Protected routes middleware</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ Database Integration</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• MongoDB with Mongoose ODM</li>
                  <li>• User, Video, Comment schemas</li>
                  <li>• Follow/Gift relationship models</li>
                  <li>• Automatic relationship updates</li>
                  <li>• Transaction handling</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ Video Platform</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Video upload and management</li>
                  <li>• TikTok-style feed interface</li>
                  <li>• Like and comment system</li>
                  <li>• Video monetization</li>
                  <li>• Creator analytics</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ Social Features</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Follow/unfollow system</li>
                  <li>• User profiles with stats</li>
                  <li>• Gift sending between users</li>
                  <li>• Wallet and earnings tracking</li>
                  <li>• Real-time updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild className="h-20 flex-col">
                <a href="/test-auth">
                  <Database className="h-6 w-6 mb-2" />
                  Test APIs
                </a>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <a href="/register">
                  <Key className="h-6 w-6 mb-2" />
                  Register User
                </a>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <a href="/dashboard">
                  <Server className="h-6 w-6 mb-2" />
                  Dashboard
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
