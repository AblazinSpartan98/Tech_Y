import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StoreLocator() {
  return (
    <div className="grid md:grid-cols-2 gap-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Our Store Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
    </div>
  )
}
