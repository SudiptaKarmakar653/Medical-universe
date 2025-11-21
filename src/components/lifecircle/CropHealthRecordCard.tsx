import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

// Digital Crop Health Record Card
export default function CropHealthRecordCard() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [plotName, setPlotName] = useState("");
  const [cropType, setCropType] = useState("");
  const [loading, setLoading] = useState(false);
  // Soil report
  const [soilFile, setSoilFile] = useState(null);
  const [soilUploading, setSoilUploading] = useState(false);
  // Treatments
  const [treatments, setTreatments] = useState([]);
  const [treatmentForm, setTreatmentForm] = useState({ name: "", type: "", dose: "", date: "", notes: "" });
  const [treatmentLoading, setTreatmentLoading] = useState(false);
  // Symptoms
  const [symptoms, setSymptoms] = useState([]);
  const [symptomForm, setSymptomForm] = useState({ symptom: "", date: "", notes: "", image: null });
  const [symptomLoading, setSymptomLoading] = useState(false);
  // Timeline
  const [timelines, setTimelines] = useState([]);
  const [timelineForm, setTimelineForm] = useState({ stage: "", date: "", notes: "", image: null });
  const [timelineLoading, setTimelineLoading] = useState(false);
  // Selected record
  const [selected, setSelected] = useState(null);

  // Fetch all records for user
  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("crop-health-record", {
      body: { action: "get_records" },
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRecords(data.data || []);
    setLoading(false);
  }

  // Fetch treatments, symptoms, timelines for selected record
  async function fetchDetails(record_id) {
    setTreatmentLoading(true);
    setSymptomLoading(true);
    setTimelineLoading(true);
    const [treat, symp, time] = await Promise.all([
      supabase.functions.invoke("crop-health-record", { body: { action: "get_treatments", payload: { record_id } } }),
      supabase.functions.invoke("crop-health-record", { body: { action: "get_symptoms", payload: { record_id } } }),
      supabase.functions.invoke("crop-health-record", { body: { action: "get_timelines", payload: { record_id } } }),
    ]);
    setTreatments(treat.data?.data || []);
    setSymptoms(symp.data?.data || []);
    setTimelines(time.data?.data || []);
    setTreatmentLoading(false);
    setSymptomLoading(false);
    setTimelineLoading(false);
  }

  async function createRecord(e) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("crop-health-record", {
      body: { action: "create_record", payload: { plot_name: plotName, crop_type: cropType } },
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Record created" });
      setPlotName("");
      setCropType("");
      fetchRecords();
    }
    setLoading(false);
  }

  // Soil report upload
  async function uploadSoilReport(record_id) {
    if (!soilFile) return;
    setSoilUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];
      const { data, error } = await supabase.functions.invoke("crop-health-record", {
        body: { action: "upload_soil_report", payload: { record_id, file_base64: base64, file_name: soilFile.name } },
      });
      if (error) toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      else toast({ title: "Soil report uploaded" });
      setSoilUploading(false);
      setSoilFile(null);
      fetchRecords();
    };
    reader.readAsDataURL(soilFile);
  }

  // Add treatment
  async function addTreatment(e) {
    e.preventDefault();
    setTreatmentLoading(true);
    const { data, error } = await supabase.functions.invoke("crop-health-record", {
      body: { action: "add_treatment", payload: { ...treatmentForm, record_id: selected.id } },
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setTreatmentForm({ name: "", type: "", dose: "", date: "", notes: "" });
      fetchDetails(selected.id);
    }
    setTreatmentLoading(false);
  }
  async function deleteTreatment(id) {
    setTreatmentLoading(true);
    await supabase.functions.invoke("crop-health-record", { body: { action: "delete_treatment", payload: { id } } });
    fetchDetails(selected.id);
    setTreatmentLoading(false);
  }

  // Add symptom
  async function addSymptom(e) {
    e.preventDefault();
    setSymptomLoading(true);
    let image_base64 = null;
    if (symptomForm.image) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        image_base64 = reader.result.split(",")[1];
        await submitSymptom(image_base64);
      };
      reader.readAsDataURL(symptomForm.image);
      return;
    }
    await submitSymptom(image_base64);
  }
  async function submitSymptom(image_base64) {
    const { data, error } = await supabase.functions.invoke("crop-health-record", {
      body: { action: "add_symptom", payload: { ...symptomForm, record_id: selected.id, image_base64, image_name: symptomForm.image?.name } },
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setSymptomForm({ symptom: "", date: "", notes: "", image: null });
      fetchDetails(selected.id);
    }
    setSymptomLoading(false);
  }

  // Add timeline
  async function addTimeline(e) {
    e.preventDefault();
    setTimelineLoading(true);
    let image_base64 = null;
    if (timelineForm.image) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        image_base64 = reader.result.split(",")[1];
        await submitTimeline(image_base64);
      };
      reader.readAsDataURL(timelineForm.image);
      return;
    }
    await submitTimeline(image_base64);
  }
  async function submitTimeline(image_base64) {
    const { data, error } = await supabase.functions.invoke("crop-health-record", {
      body: { action: "add_timeline", payload: { ...timelineForm, record_id: selected.id, image_base64, image_name: timelineForm.image?.name } },
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setTimelineForm({ stage: "", date: "", notes: "", image: null });
      fetchDetails(selected.id);
    }
    setTimelineLoading(false);
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle>Digital Crop Health Record</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Create new record */}
        <form className="flex flex-col md:flex-row gap-4 mb-6" onSubmit={createRecord}>
          <Input placeholder="Plot/Field Name" value={plotName} onChange={e => setPlotName(e.target.value)} required />
          <Input placeholder="Crop Type" value={cropType} onChange={e => setCropType(e.target.value)} required />
          <Button type="submit" disabled={loading} className="min-w-[120px]">{loading ? "Saving..." : "Add Record"}</Button>
        </form>
        {/* List records */}
        <div className="space-y-4">
          {records.length === 0 && <div className="text-gray-500">No crop health records found.</div>}
          {records.map((rec) => (
            <Card key={rec.id} className="bg-green-50 border-green-200">
              <CardContent className="flex flex-col gap-2 py-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="font-semibold text-green-900">{rec.plot_name}</div>
                  <div className="text-green-700">{rec.crop_type}</div>
                  <div className="text-xs text-gray-500 ml-auto">Created: {rec.created_at?.slice(0,10)}</div>
                  <Button size="sm" variant="outline" onClick={() => { setSelected(rec); fetchDetails(rec.id); }}>View Details</Button>
                </div>
                {/* Soil report upload */}
                {selected?.id === rec.id && (
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-2 font-medium">Soil Test Report:</div>
                    {rec.soil_report_url ? (
                      <a href={rec.soil_report_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Uploaded Report</a>
                    ) : (
                      <form className="flex gap-2 items-center" onSubmit={e => { e.preventDefault(); uploadSoilReport(rec.id); }}>
                        <Input type="file" accept="application/pdf" onChange={e => setSoilFile(e.target.files[0])} required />
                        <Button type="submit" disabled={soilUploading}>{soilUploading ? "Uploading..." : "Upload"}</Button>
                      </form>
                    )}
                  </div>
                  )}
                {/* Treatments */}
                {selected?.id === rec.id && (
                  <div className="mt-6">
                    <div className="font-medium mb-2">Treatment History</div>
                    <form className="flex flex-col md:flex-row gap-2 mb-2" onSubmit={addTreatment}>
                      <Input placeholder="Type (Fertilizer/Pesticide)" value={treatmentForm.type} onChange={e => setTreatmentForm(f => ({ ...f, type: e.target.value }))} required />
                      <Input placeholder="Name" value={treatmentForm.name} onChange={e => setTreatmentForm(f => ({ ...f, name: e.target.value }))} required />
                      <Input placeholder="Dose" value={treatmentForm.dose} onChange={e => setTreatmentForm(f => ({ ...f, dose: e.target.value }))} />
                      <Input type="date" value={treatmentForm.date} onChange={e => setTreatmentForm(f => ({ ...f, date: e.target.value }))} required />
                      <Input placeholder="Notes" value={treatmentForm.notes} onChange={e => setTreatmentForm(f => ({ ...f, notes: e.target.value }))} />
                      <Button type="submit" disabled={treatmentLoading}>{treatmentLoading ? "Saving..." : "Add"}</Button>
                    </form>
                    <div className="space-y-1">
                      {treatments.length === 0 && <div className="text-gray-400">No treatments yet.</div>}
                      {treatments.map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-sm bg-white rounded px-2 py-1 border">
                          <span className="font-medium">{t.type}</span>
                          <span>{t.name}</span>
                          <span className="text-xs text-gray-500">{t.dose}</span>
                          <span className="text-xs text-gray-500">{t.date}</span>
                          <span className="text-xs text-gray-400">{t.notes}</span>
                          <Button size="xs" variant="ghost" onClick={() => deleteTreatment(t.id)}>Delete</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Symptoms */}
                {selected?.id === rec.id && (
                  <div className="mt-6">
                    <div className="font-medium mb-2">Symptoms / Case History</div>
                    <form className="flex flex-col md:flex-row gap-2 mb-2" onSubmit={addSymptom}>
                      <Input placeholder="Symptom" value={symptomForm.symptom} onChange={e => setSymptomForm(f => ({ ...f, symptom: e.target.value }))} required />
                      <Input type="date" value={symptomForm.date} onChange={e => setSymptomForm(f => ({ ...f, date: e.target.value }))} required />
                      <Input type="file" accept="image/*" onChange={e => setSymptomForm(f => ({ ...f, image: e.target.files[0] }))} />
                      <Input placeholder="Notes" value={symptomForm.notes} onChange={e => setSymptomForm(f => ({ ...f, notes: e.target.value }))} />
                      <Button type="submit" disabled={symptomLoading}>{symptomLoading ? "Saving..." : "Add"}</Button>
                    </form>
                    <div className="space-y-1">
                      {symptoms.length === 0 && <div className="text-gray-400">No symptoms yet.</div>}
                      {symptoms.map(s => (
                        <div key={s.id} className="flex items-center gap-2 text-sm bg-white rounded px-2 py-1 border">
                          <span className="font-medium">{s.symptom}</span>
                          <span className="text-xs text-gray-500">{s.date}</span>
                          {s.image_url && <img src={s.image_url} alt="symptom" className="h-8 w-8 object-cover rounded" />}
                          <span className="text-xs text-gray-400">{s.notes}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Timeline */}
                {selected?.id === rec.id && (
                  <div className="mt-6">
                    <div className="font-medium mb-2">Growth Timeline</div>
                    <form className="flex flex-col md:flex-row gap-2 mb-2" onSubmit={addTimeline}>
                      <Input placeholder="Stage (e.g. Seedling)" value={timelineForm.stage} onChange={e => setTimelineForm(f => ({ ...f, stage: e.target.value }))} required />
                      <Input type="date" value={timelineForm.date} onChange={e => setTimelineForm(f => ({ ...f, date: e.target.value }))} required />
                      <Input type="file" accept="image/*" onChange={e => setTimelineForm(f => ({ ...f, image: e.target.files[0] }))} />
                      <Input placeholder="Notes" value={timelineForm.notes} onChange={e => setTimelineForm(f => ({ ...f, notes: e.target.value }))} />
                      <Button type="submit" disabled={timelineLoading}>{timelineLoading ? "Saving..." : "Add"}</Button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      {timelines.length === 0 && <div className="text-gray-400">No timeline entries yet.</div>}
                      {timelines.map(tl => (
                        <div key={tl.id} className="flex flex-col items-center bg-white rounded px-2 py-1 border">
                          <span className="font-medium">{tl.stage}</span>
                          <span className="text-xs text-gray-500">{tl.date}</span>
                          {tl.image_url && <img src={tl.image_url} alt="timeline" className="h-12 w-12 object-cover rounded" />}
                          <span className="text-xs text-gray-400">{tl.notes}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
