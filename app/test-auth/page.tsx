"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestAuthPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, success: boolean, data?: any) => {
    setResults((prev) => [...prev, { test, success, data, timestamp: new Date().toISOString() }])
  }

  const testRegistration = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: `testuser${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          password: "testpassword123",
          displayName: "Test User",
        }),
      })

      const data = await response.json()
      addResult("User Registration", response.ok, data)
    } catch (error) {
      addResult("User Registration", false, { error: error.message })
    }
    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: "test@example.com",
          password: "testpassword123",
        }),
      })

      const data = await response.json()
      addResult("User Login", response.ok, data)
    } catch (error) {
      addResult("User Login", false, { error: error.message })
    }
    setLoading(false)
  }

  const testGetUser = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      const data = await response.json()
      addResult("Get Current User", response.ok, data)
    } catch (error) {
      addResult("Get Current User", false, { error: error.message })
    }
    setLoading(false)
  }

  const testVideoUpload = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: "Test Video",
          description: "This is a test video upload",
          type: "long-form",
          videoUrl: "https://youtube.com/watch?v=test",
          price: 99,
          tags: ["test", "demo"],
        }),
      })

      const data = await response.json()
      addResult("Video Upload", response.ok, data)
    } catch (error) {
      addResult("Video Upload", false, { error: error.message })
    }
    setLoading(false)
  }

  const testGetVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/videos?page=1&limit=5")
      const data = await response.json()
      addResult("Get Videos", response.ok, data)
    } catch (error) {
      addResult("Get Videos", false, { error: error.message })
    }
    setLoading(false)
  }

  const testDashboardStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/dashboard/stats", {
        credentials: "include",
      })
      const data = await response.json()
      addResult("Dashboard Stats", response.ok, data)
    } catch (error) {
      addResult("Dashboard Stats", false, { error: error.message })
    }
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Testing Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <Button onClick={testRegistration} disabled={loading} variant="outline">
                Test Registration
              </Button>
              <Button onClick={testLogin} disabled={loading} variant="outline">
                Test Login
              </Button>
              <Button onClick={testGetUser} disabled={loading} variant="outline">
                Test Get User
              </Button>
              <Button onClick={testVideoUpload} disabled={loading} variant="outline">
                Test Video Upload
              </Button>
              <Button onClick={testGetVideos} disabled={loading} variant="outline">
                Test Get Videos
              </Button>
              <Button onClick={testDashboardStats} disabled={loading} variant="outline">
                Test Dashboard
              </Button>
            </div>
            <div className="flex space-x-4">
              <Button onClick={clearResults} variant="destructive" size="sm">
                Clear Results
              </Button>
              <Badge variant="outline">{results.length} tests run</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500">No tests run yet. Click the buttons above to test the API.</p>
              ) : (
                results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{result.test}</h4>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "SUCCESS" : "FAILED"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{result.timestamp}</p>
                    <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
