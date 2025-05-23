import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StoreLocationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Visit Our Store</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Address</h4>
                  <p className="text-gray-500">123 Tech Street, Silicon Valley, CA 94043</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p className="text-gray-500">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-gray-500">contact@techcomponents.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Store Hours</h4>
                  <p className="text-gray-500">Monday - Friday: 9AM - 8PM</p>
                  <p className="text-gray-500">Saturday: 10AM - 6PM</p>
                  <p className="text-gray-500">Sunday: 12PM - 5PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>In-Store Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">PC Building Service</h4>
                <p className="text-gray-500">
                  Our expert technicians can build your custom PC with the components you choose.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Technical Support</h4>
                <p className="text-gray-500">
                  Get help with troubleshooting, upgrades, and technical advice from our knowledgeable staff.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Component Testing</h4>
                <p className="text-gray-500">
                  We can test your components to ensure they're working properly before you leave the store.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Warranty Service</h4>
                <p className="text-gray-500">
                  Bring in your products purchased from us for warranty service and repairs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="h-[400px] bg-gray-200 rounded-lg overflow-hidden">
            {/* This would be replaced with an actual map component in a real implementation */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Map would be displayed here</p>
                <p className="text-sm text-gray-400">
                  (In a real implementation, this would use Google Maps, Mapbox, or another mapping service)
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="directions">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="directions">Directions</TabsTrigger>
              <TabsTrigger value="parking">Parking</TabsTrigger>
              <TabsTrigger value="transit">Public Transit</TabsTrigger>
            </TabsList>
            <TabsContent value="directions" className="p-4 border rounded-md mt-2">
              <h4 className="font-semibold mb-2">Getting Here</h4>
              <p className="mb-4">
                Our store is conveniently located in the heart of Silicon Valley, easily accessible from major highways.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>From Highway 101: Take exit 123 and head east on Tech Blvd for 0.5 miles.</li>
                <li>From Interstate 280: Take exit 45 and head north on Innovation Drive for 1 mile.</li>
                <li>
                  Look for our large storefront with the "Tech Components" sign in the Technopark Shopping Center.
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="parking" className="p-4 border rounded-md mt-2">
              <h4 className="font-semibold mb-2">Parking Information</h4>
              <p className="mb-4">We offer free parking for all our customers.</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Large parking lot with over 100 spaces directly in front of the store.</li>
                <li>Reserved spots for customers picking up online orders.</li>
                <li>Accessible parking spaces available near the entrance.</li>
                <li>Additional overflow parking available behind the building during peak hours.</li>
              </ul>
            </TabsContent>
            <TabsContent value="transit" className="p-4 border rounded-md mt-2">
              <h4 className="font-semibold mb-2">Public Transportation</h4>
              <p className="mb-4">Several public transit options are available to reach our store:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Bus: Routes 22, 35, and 87 stop directly in front of the shopping center.</li>
                <li>Light Rail: The Tech Station is a 5-minute walk from our store.</li>
                <li>
                  Ride Share: A designated pickup/dropoff zone is located at the north entrance of the shopping center.
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-bold mb-4">Upcoming In-Store Events</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-primary font-semibold mb-2">May 20, 2025 • 6:00 PM</div>
              <h3 className="text-xl font-bold mb-2">PC Building Workshop</h3>
              <p className="text-gray-500 mb-4">
                Learn how to build your own PC from our expert technicians. Hands-on experience with the latest
                components.
              </p>
              <div className="text-sm text-gray-500">Registration required • Free</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-primary font-semibold mb-2">May 25, 2025 • 2:00 PM</div>
              <h3 className="text-xl font-bold mb-2">Gaming Tournament</h3>
              <p className="text-gray-500 mb-4">
                Compete in our monthly gaming tournament. Prizes for the winners and special discounts for all
                participants.
              </p>
              <div className="text-sm text-gray-500">Walk-ins welcome • $10 entry fee</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-primary font-semibold mb-2">June 5, 2025 • 7:00 PM</div>
              <h3 className="text-xl font-bold mb-2">New GPU Launch Event</h3>
              <p className="text-gray-500 mb-4">
                Be the first to see and test the newest graphics cards. Special launch day pricing and giveaways.
              </p>
              <div className="text-sm text-gray-500">RSVP required • Free</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
