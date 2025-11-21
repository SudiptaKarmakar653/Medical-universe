import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlantIdentificationResult } from './PlantIdentifier';
import { Leaf, Activity, Heart, Droplets, Sun, Calendar, Palette, Beaker } from 'lucide-react';
interface PlantResultsProps {
  results: PlantIdentificationResult[];
}
const PlantResults: React.FC<PlantResultsProps> = ({
  results
}) => {
  const topResult = results[0];
  if (!topResult) return null;
  const confidenceColor = topResult.probability > 0.8 ? 'text-green-600' : topResult.probability > 0.6 ? 'text-yellow-600' : 'text-red-600';
  return <div className="space-y-6">
      <Card className="border-medical-aqua/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-medical-aqua" />
            Plant Identification Results
          </CardTitle>
          <CardDescription>
            Confidence Level: <span className={`font-semibold ${confidenceColor}`}>
              {Math.round(topResult.probability * 100)}%
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{topResult.plant_name}</h3>
              <p className="text-gray-600 italic">{topResult.scientific_name}</p>
            </div>
            
            {topResult.plant_details.common_names.length > 0 && <div>
                <h4 className="font-semibold mb-2">Common Names:</h4>
                <div className="flex flex-wrap gap-2">
                  {topResult.plant_details.common_names.map((name, index) => <Badge key={index} variant="secondary">{name}</Badge>)}
                </div>
              </div>}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="medicinal" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-lime-400">
          <TabsTrigger value="medicinal" className="text-gray-950">Medicinal Uses</TabsTrigger>
          <TabsTrigger value="plant-care" className="text-stone-950">Plant Care</TabsTrigger>
          <TabsTrigger value="ayurvedic" className="text-gray-950">Ayurvedic Properties</TabsTrigger>
          <TabsTrigger value="health" className="text-gray-950">Health Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="medicinal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-medical-aqua" />
                Medicinal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topResult.plant_details.medicinal_uses.length > 0 ? <div>
                  <h4 className="font-semibold mb-3">Ayurvedic Medicinal Uses:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {topResult.plant_details.medicinal_uses.map((use, index) => <li key={index} className="leading-relaxed">{use}</li>)}
                  </ul>
                </div> : <p className="text-gray-500">No specific medicinal uses information available for this plant.</p>}
              
              {topResult.plant_details.part_used_medicinally.length > 0 && <div>
                  <h4 className="font-semibold mb-2">Parts Used Medicinally:</h4>
                  <div className="flex flex-wrap gap-2">
                    {topResult.plant_details.part_used_medicinally.map((part, index) => <Badge key={index} variant="outline">{part}</Badge>)}
                  </div>
                </div>}
              
              {topResult.plant_details.chemical_constituents.length > 0 && <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Beaker className="h-4 w-4" />
                    Chemical Constituents:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {topResult.plant_details.chemical_constituents.map((constituent, index) => <Badge key={index} className="bg-indigo-100 text-indigo-800">{constituent}</Badge>)}
                  </div>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plant-care" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-medical-aqua" />
                Plant Care Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Droplets className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <span className="font-semibold block">Watering:</span>
                      <span className="text-gray-600">{topResult.plant_details.watering}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Sun className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <span className="font-semibold block">Sun Requirements:</span>
                      <span className="text-gray-600">{topResult.plant_details.sun_requirements}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <span className="font-semibold block">Growth Rate:</span>
                      <span className="text-gray-600">{topResult.plant_details.growth_rate}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-purple-500 mt-1" />
                    <div>
                      <span className="font-semibold block">Flowering Season:</span>
                      <span className="text-gray-600">{topResult.plant_details.flowering_season}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {topResult.plant_details.propagation_methods.length > 0 && <div className="mt-6">
                  <h4 className="font-semibold mb-2">Propagation Methods:</h4>
                  <div className="flex flex-wrap gap-2">
                    {topResult.plant_details.propagation_methods.map((method, index) => <Badge key={index} variant="outline">{method}</Badge>)}
                  </div>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ayurvedic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-medical-aqua" />
                Ayurvedic Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topResult.plant_details.ayurvedic_properties && <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Rasa (Taste):</h4>
                    <div className="flex flex-wrap gap-2">
                      {topResult.plant_details.ayurvedic_properties.rasa.map((taste, index) => <Badge key={index} className="bg-orange-100 text-orange-800">{taste}</Badge>)}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Virya (Potency):</h4>
                    <Badge className="bg-blue-100 text-blue-800">
                      {topResult.plant_details.ayurvedic_properties.virya}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Vipaka (Post-digestive effect):</h4>
                    <Badge className="bg-purple-100 text-purple-800">
                      {topResult.plant_details.ayurvedic_properties.vipaka}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Dosha Effects:</h4>
                    <div className="flex flex-wrap gap-2">
                      {topResult.plant_details.ayurvedic_properties.dosha_effects.map((effect, index) => <Badge key={index} className="bg-green-100 text-green-800">{effect}</Badge>)}
                    </div>
                  </div>
                </div>}
              
              {topResult.plant_details.ayurvedic_properties?.therapeutic_uses.length > 0 && <div>
                  <h4 className="font-semibold mb-2">Therapeutic Uses:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {topResult.plant_details.ayurvedic_properties.therapeutic_uses.map((use, index) => <li key={index}>{use}</li>)}
                  </ul>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-medical-aqua" />
                Health Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Plant Health Status:</span>
                  <Badge className={topResult.health_assessment.is_healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {topResult.health_assessment.is_healthy ? 'Healthy' : 'Issues Detected'}
                  </Badge>
                </div>
                
                {topResult.health_assessment.diseases.length > 0 && <div>
                    <h4 className="font-semibold mb-2">Detected Issues:</h4>
                    <div className="flex flex-wrap gap-2">
                      {topResult.health_assessment.diseases.map((disease, index) => <Badge key={index} variant="destructive">{disease}</Badge>)}
                    </div>
                  </div>}
                
                {topResult.health_assessment.disease_details.length > 0 && <div className="space-y-3">
                    <h4 className="font-semibold">Disease Details & Treatment:</h4>
                    {topResult.health_assessment.disease_details.map((detail, index) => <div key={index} className="border-l-4 border-medical-aqua pl-4">
                        <p className="text-gray-700 mb-1">{detail.description}</p>
                        <p className="text-sm text-gray-600"><strong>Treatment:</strong> {detail.treatment}</p>
                      </div>)}
                  </div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default PlantResults;