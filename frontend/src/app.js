import axios from "axios";
import { BarChart3, FlaskConical, Home, Leaf, MapPin, Plus, QrCode, Shield, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./app.css";

// CORRECTED: All component imports now use the simple paths from your original code
import { toast, Toaster } from "sonner";
import { Badge } from "./components/badge";
import { Button } from "./components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/dialog";
import { Input } from "./components/input";
import { Label } from "./components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/select";
import { Textarea } from "./components/textarea";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// --- HELPER: Dynamically load Leaflet (map library) ---
const useLeaflet = () => {
  useEffect(() => {
    if (document.getElementById('leaflet-css')) return; // Prevent duplicate injection

    const cssLink = document.createElement('link');
    cssLink.id = 'leaflet-css';
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById('leaflet-css');
      const js = document.getElementById('leaflet-js');
      if (css) document.head.removeChild(css);
      if (js) document.body.removeChild(js);
    };
  }, []);
};

// --- COMPONENT: Interactive Map for Picking a Location ---
const MapPicker = ({ lat, lng, onLocationChange }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const isMapInitialized = useRef(false);

  useEffect(() => {
    const initializeMap = () => {
      if (window.L && !isMapInitialized.current) {
        const initialLat = lat || 20.5937;
        const initialLng = lng || 78.9629;
        
        mapRef.current = window.L.map('map-picker').setView([initialLat, initialLng], 5);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current);
        
        markerRef.current = window.L.marker([initialLat, initialLng]).addTo(mapRef.current);
        
        mapRef.current.on('click', function(e) {
          const { lat, lng } = e.latlng;
          markerRef.current.setLatLng(e.latlng);
          onLocationChange(lat, lng);
        });
        isMapInitialized.current = true;
      }
    };

    if (window.L) {
      initializeMap();
    } else {
      const script = document.getElementById('leaflet-js');
      script.addEventListener('load', initializeMap);
    }

  }, [lat, lng, onLocationChange]);

  return <div id="map-picker" style={{ height: '300px', width: '100%', borderRadius: '8px', zIndex: 0 }}></div>;
};

// --- COMPONENT: Static Map for Displaying a Location ---
const DisplayMap = ({ lat, lng }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const initializeMap = () => {
       if (window.L && mapContainerRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = window.L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 13,
          scrollWheelZoom: false,
          dragging: false,
          zoomControl: false,
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
        window.L.marker([lat, lng]).addTo(mapInstanceRef.current);
      }
    }
    
    if (window.L) {
      initializeMap();
    } else {
      const script = document.getElementById('leaflet-js');
      script.addEventListener('load', initializeMap);
    }
   
  }, [lat, lng]);

  return <div ref={mapContainerRef} style={{ height: '150px', width: '100%', borderRadius: '8px', marginTop: '8px' }}></div>;
};

// Hero Section Component
const HeroSection = () => {
  const [qrInput, setQrInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleQRScan = async () => {
    if (!qrInput.trim()) {
      toast.error("Please enter a product ID or QR code");
      return;
    }
    
    setIsScanning(true);
    try {
      const productId = qrInput.includes('/trace/') 
        ? qrInput.split('/trace/')[1] 
        : qrInput;
      
      window.location.href = `/trace/${productId}`;
    } catch (error) {
      toast.error("Failed to scan QR code");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-10"><div className="absolute top-10 left-10 w-64 h-64 bg-emerald-200 rounded-full blur-3xl"></div><div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-200 rounded-full blur-3xl"></div><div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-200 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div></div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="mb-8"><Badge className="mb-4 px-4 py-2 bg-emerald-100 text-emerald-800 border-emerald-200"><Leaf className="w-4 h-4 mr-2" />Smart India Hackathon 2024</Badge><h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent mb-6 leading-tight">HerBlock</h1><p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-4xl mx-auto font-medium">Blockchain-Powered Ayurvedic Herb Traceability System</p><p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">Track your Ayurvedic herbs from farm to formulation with immutable blockchain technology. Ensure authenticity, quality, and sustainable sourcing with complete transparency.</p></div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12 max-w-2xl mx-auto"><div className="flex items-center justify-center mb-6"><QrCode className="w-16 h-16 text-emerald-600 mr-4" /><div className="text-left"><h3 className="text-2xl font-bold text-gray-800">Scan & Trace</h3><p className="text-gray-600">Enter QR code or Product ID to trace your herb's journey</p></div></div><div className="flex gap-4 mb-4"><Input placeholder="Enter QR code URL or Product ID..." value={qrInput} onChange={(e) => setQrInput(e.target.value)} className="flex-1 h-12 text-lg border-emerald-200 focus:border-emerald-500" onKeyPress={(e) => e.key === 'Enter' && handleQRScan()} /><Button onClick={handleQRScan} disabled={isScanning} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white">{isScanning ? "Scanning..." : "Trace"}</Button></div><p className="text-sm text-gray-500">Try demo ID: <code className="bg-gray-100 px-2 py-1 rounded text-emerald-600">demo-ashwagandha-001</code></p></div>
        <div className="grid md:grid-cols-3 gap-8 mb-12"><Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all"><CardHeader className="pb-4"><Shield className="w-12 h-12 text-emerald-600 mx-auto mb-2" /><CardTitle className="text-xl">Blockchain Security</CardTitle></CardHeader><CardContent><p className="text-gray-600">Immutable records with Hyperledger Fabric ensure complete data integrity and trust.</p></CardContent></Card><Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all"><CardHeader className="pb-4"><MapPin className="w-12 h-12 text-teal-600 mx-auto mb-2" /><CardTitle className="text-xl">Geo-Tagging</CardTitle></CardHeader><CardContent><p className="text-gray-600">GPS-enabled tracking from collection point to final formulation with location verification.</p></CardContent></Card><Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all"><CardHeader className="pb-4"><Leaf className="w-12 h-12 text-green-600 mx-auto mb-2" /><CardTitle className="text-xl">Quality Assurance</CardTitle></CardHeader><CardContent><p className="text-gray-600">Smart contracts enforce quality standards and sustainability guidelines automatically.</p></CardContent></Card></div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center"><Button size="lg" className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white text-lg" onClick={() => window.location.href = '/dashboard'}><BarChart3 className="w-5 h-5 mr-2" />View Dashboard</Button><Button size="lg" variant="outline" className="h-14 px-8 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-lg" onClick={() => window.location.href = '/dashboard'}><Plus className="w-5 h-5 mr-2" />Add New Product</Button></div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { fetchAnalytics(); }, []);
  const fetchAnalytics = async () => { try { const response = await axios.get(`${API}/analytics/dashboard`); setAnalytics(response.data); } catch (error) { toast.error("Failed to load dashboard analytics"); } finally { setLoading(false); } };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><Leaf className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-pulse" /><p className="text-gray-600">Loading dashboard...</p></div></div>;
  return (
    <div className="min-h-screen bg-gray-50 p-6"><div className="max-w-7xl mx-auto"><div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 mb-2">HerBlock Dashboard</h1><p className="text-gray-600">Monitor your Ayurvedic herb supply chain</p></div>{analytics && (<div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-600">{analytics.statistics.total_products}</div></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Collections</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{analytics.statistics.total_collections}</div></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Processing Steps</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{analytics.statistics.total_processing}</div></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Quality Tests</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{analytics.statistics.total_quality_tests}</div></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Blockchain Txs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{analytics.statistics.total_blockchain_transactions}</div></CardContent></Card></div>)}{/* Quick Actions */}<div className="grid md:grid-cols-4 gap-4 mb-8"><AddCollectionDialog /><AddProcessingDialog /><AddQualityTestDialog /><AddProductDialog /></div>{/* Recent Activities */}<div className="grid md:grid-cols-2 gap-8"><Card><CardHeader><CardTitle>Recent Collections</CardTitle><CardDescription>Latest herb collection events</CardDescription></CardHeader><CardContent>{analytics?.recent_collections?.length > 0 ? (<div className="space-y-4">{analytics.recent_collections.map((collection) => (<div key={collection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">{collection.species_name}</p><p className="text-sm text-gray-600">{collection.collector_name}</p><p className="text-xs text-gray-500">{collection.location_name}</p></div><Badge variant="outline">{collection.quality_grade}</Badge></div>))}</div>) : (<p className="text-gray-500 text-center py-8">No collections yet</p>)}</CardContent></Card><Card><CardHeader><CardTitle>Recent Products</CardTitle><CardDescription>Latest formulated products</CardDescription></CardHeader><CardContent>{analytics?.recent_products?.length > 0 ? (<div className="space-y-4">{analytics.recent_products.map((product) => (<div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">{product.product_name}</p><p className="text-sm text-gray-600">{product.manufacturer}</p><p className="text-xs text-gray-500">Batch: {product.batch_id}</p></div><Button size="sm" variant="outline"><QrCode className="w-4 h-4" /></Button></div>))}</div>) : (<p className="text-gray-500 text-center py-8">No products yet</p>)}</CardContent></Card></div></div></div>
  );
};

// AddCollectionDialog Component
const AddCollectionDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', collector_name: '', species_name: 'Ashwagandha', latitude: '', longitude: '', location_name: '', quantity_kg: '', quality_grade: 'A', weather_conditions: '', organic_certified: false });
  const handleLocationChange = (lat, lng) => { setFormData(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) })); };
  const handleSubmit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/collection`, { ...formData, collector_id: `collector_${Date.now()}`, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude), quantity_kg: parseFloat(formData.quantity_kg) }); toast.success("Collection event added successfully!"); setOpen(false); setFormData({ product_id: '', collector_name: '', species_name: 'Ashwagandha', latitude: '', longitude: '', location_name: '', quantity_kg: '', quality_grade: 'A', weather_conditions: '', organic_certified: false }); } catch (error) { const errorMessage = error.response?.data?.detail || "Failed to add collection event"; toast.error(errorMessage); } };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="h-20 flex-col gap-2 bg-emerald-600 hover:bg-emerald-700"><Leaf className="w-6 h-6" />Add Collection</Button></DialogTrigger>
      <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Add Collection Event</DialogTitle><DialogDescription>Record a new herb collection. Click on the map to set the location.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Collection Location (Click to set)</Label>{open && <MapPicker lat={formData.latitude ? parseFloat(formData.latitude) : null} lng={formData.longitude ? parseFloat(formData.longitude) : null} onLocationChange={handleLocationChange} />}</div>
          <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="latitude">Latitude</Label><Input id="latitude" type="number" value={formData.latitude} required readOnly /></div><div><Label htmlFor="longitude">Longitude</Label><Input id="longitude" type="number" value={formData.longitude} required readOnly /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="product_id">Batch ID</Label><Input id="product_id" value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} required /></div><div><Label htmlFor="collector_name">Collector Name</Label><Input id="collector_name" value={formData.collector_name} onChange={(e) => setFormData({...formData, collector_name: e.target.value})} required /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="species_name">Species</Label><Select value={formData.species_name} onValueChange={(value) => setFormData({...formData, species_name: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Ashwagandha">Ashwagandha</SelectItem><SelectItem value="Turmeric">Turmeric</SelectItem><SelectItem value="Tulsi">Tulsi</SelectItem><SelectItem value="Neem">Neem</SelectItem></SelectContent></Select></div><div><Label htmlFor="location_name">Location Name</Label><Input id="location_name" value={formData.location_name} onChange={(e) => setFormData({...formData, location_name: e.target.value})} required /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="quantity_kg">Quantity (kg)</Label><Input id="quantity_kg" type="number" step="0.1" value={formData.quantity_kg} onChange={(e) => setFormData({...formData, quantity_kg: e.target.value})} required /></div><div><Label htmlFor="quality_grade">Quality Grade</Label><Select value={formData.quality_grade} onValueChange={(value) => setFormData({...formData, quality_grade: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="A">Grade A</SelectItem><SelectItem value="B">Grade B</SelectItem><SelectItem value="C">Grade C</SelectItem></SelectContent></Select></div></div>
          <div><Label htmlFor="weather_conditions">Weather Conditions</Label><Input id="weather_conditions" value={formData.weather_conditions} onChange={(e) => setFormData({...formData, weather_conditions: e.target.value})} /></div>
          <Button type="submit" className="w-full">Add Collection</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Add Processing Dialog Component
const AddProcessingDialog = () => {
  const [open, setOpen] = useState(false); const [formData, setFormData] = useState({ product_id: '', facility_name: '', process_type: 'drying', temperature: '', duration_hours: '', equipment_used: '', operator_name: '', output_quantity_kg: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/processing`, { ...formData, facility_id: `facility_${Date.now()}`, temperature: formData.temperature ? parseFloat(formData.temperature) : null, duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : null, output_quantity_kg: parseFloat(formData.output_quantity_kg) }); toast.success("Processing step added successfully!"); setOpen(false); } catch (error) { toast.error("Failed to add processing step"); } };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700"><Users className="w-6 h-6" />Add Processing</Button></DialogTrigger><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add Processing Step</DialogTitle><DialogDescription>Record herb processing operation</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label htmlFor="product_id">Batch ID</Label><Input id="product_id" value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} required /></div><div><Label htmlFor="facility_name">Facility Name</Label><Input id="facility_name" value={formData.facility_name} onChange={(e) => setFormData({...formData, facility_name: e.target.value})} required /></div><div><Label htmlFor="process_type">Process Type</Label><Select value={formData.process_type} onValueChange={(value) => setFormData({...formData, process_type: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="drying">Drying</SelectItem><SelectItem value="grinding">Grinding</SelectItem><SelectItem value="extraction">Extraction</SelectItem><SelectItem value="packaging">Packaging</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="temperature">Temperature (°C)</Label><Input id="temperature" type="number" value={formData.temperature} onChange={(e) => setFormData({...formData, temperature: e.target.value})} /></div><div><Label htmlFor="duration_hours">Duration (hrs)</Label><Input id="duration_hours" type="number" step="0.1" value={formData.duration_hours} onChange={(e) => setFormData({...formData, duration_hours: e.target.value})} /></div></div><div><Label htmlFor="equipment_used">Equipment Used</Label><Input id="equipment_used" value={formData.equipment_used} onChange={(e) => setFormData({...formData, equipment_used: e.target.value})} required /></div><div><Label htmlFor="operator_name">Operator Name</Label><Input id="operator_name" value={formData.operator_name} onChange={(e) => setFormData({...formData, operator_name: e.target.value})} required /></div><div><Label htmlFor="output_quantity_kg">Output Quantity (kg)</Label><Input id="output_quantity_kg" type="number" step="0.1" value={formData.output_quantity_kg} onChange={(e) => setFormData({...formData, output_quantity_kg: e.target.value})} required /></div><Button type="submit" className="w-full">Add Processing Step</Button></form></DialogContent></Dialog>
};

// Add Quality Test Dialog Component
const AddQualityTestDialog = () => {
  const [open, setOpen] = useState(false); const [formData, setFormData] = useState({ product_id: '', lab_name: '', test_type: 'moisture', test_result: '', test_value: '', test_unit: '%', pass_fail: 'PASS', tested_by: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/quality`, { ...formData, lab_id: `lab_${Date.now()}`, test_value: formData.test_value ? parseFloat(formData.test_value) : null }); toast.success("Quality test added successfully!"); setOpen(false); } catch (error) { toast.error("Failed to add quality test"); } };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="h-20 flex-col gap-2 bg-orange-600 hover:bg-orange-700"><FlaskConical className="w-6 h-6" />Add Quality Test</Button></DialogTrigger><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add Quality Test</DialogTitle><DialogDescription>Record quality test results</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label htmlFor="product_id">Batch ID</Label><Input id="product_id" value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} required /></div><div><Label htmlFor="lab_name">Lab Name</Label><Input id="lab_name" value={formData.lab_name} onChange={(e) => setFormData({...formData, lab_name: e.target.value})} required /></div><div><Label htmlFor="test_type">Test Type</Label><Select value={formData.test_type} onValueChange={(value) => setFormData({...formData, test_type: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="moisture">Moisture Content</SelectItem><SelectItem value="pesticide">Pesticide Analysis</SelectItem><SelectItem value="heavy_metals">Heavy Metals</SelectItem><SelectItem value="dna_barcoding">DNA Barcoding</SelectItem></SelectContent></Select></div><div><Label htmlFor="test_result">Test Result</Label><Textarea id="test_result" value={formData.test_result} onChange={(e) => setFormData({...formData, test_result: e.target.value})} required /></div><div className="grid grid-cols-3 gap-2"><div><Label htmlFor="test_value">Test Value</Label><Input id="test_value" type="number" step="any" value={formData.test_value} onChange={(e) => setFormData({...formData, test_value: e.target.value})} /></div><div><Label htmlFor="test_unit">Unit</Label><Input id="test_unit" value={formData.test_unit} onChange={(e) => setFormData({...formData, test_unit: e.target.value})} /></div><div><Label htmlFor="pass_fail">Result</Label><Select value={formData.pass_fail} onValueChange={(value) => setFormData({...formData, pass_fail: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PASS">PASS</SelectItem><SelectItem value="FAIL">FAIL</SelectItem></SelectContent></Select></div></div><div><Label htmlFor="tested_by">Tested By</Label><Input id="tested_by" value={formData.tested_by} onChange={(e) => setFormData({...formData, tested_by: e.target.value})} required /></div><Button type="submit" className="w-full">Add Quality Test</Button></form></DialogContent></Dialog>
};

// Add Product Dialog Component
const AddProductDialog = () => {
  const [open, setOpen] = useState(false); const [formData, setFormData] = useState({ product_name: '', batch_id: '', species_name: 'Ashwagandha', manufacturer: '', final_quantity_kg: '', price_per_kg: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await axios.post(`${API}/product`, { ...formData, manufacturing_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), final_quantity_kg: parseFloat(formData.final_quantity_kg), price_per_kg: formData.price_per_kg ? parseFloat(formData.price_per_kg) : null, certifications: ['Organic', 'GMP'] }); toast.success("Product added successfully!"); setOpen(false); } catch (error) { toast.error("Failed to add product"); } };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="h-20 flex-col gap-2 bg-purple-600 hover:bg-purple-700"><Plus className="w-6 h-6" />Add Product</Button></DialogTrigger><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add New Product</DialogTitle><DialogDescription>Create final formulated product</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div><Label htmlFor="product_name">Product Name</Label><Input id="product_name" value={formData.product_name} onChange={(e) => setFormData({...formData, product_name: e.target.value})} required /></div><div><Label htmlFor="batch_id">Batch ID</Label><Input id="batch_id" value={formData.batch_id} onChange={(e) => setFormData({...formData, batch_id: e.target.value})} required /></div><div><Label htmlFor="species_name">Primary Species</Label><Select value={formData.species_name} onValueChange={(value) => setFormData({...formData, species_name: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Ashwagandha">Ashwagandha</SelectItem><SelectItem value="Turmeric">Turmeric</SelectItem><SelectItem value="Tulsi">Tulsi</SelectItem><SelectItem value="Neem">Neem</SelectItem></SelectContent></Select></div><div><Label htmlFor="manufacturer">Manufacturer</Label><Input id="manufacturer" value={formData.manufacturer} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} required /></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="final_quantity_kg">Quantity (kg)</Label><Input id="final_quantity_kg" type="number" step="0.1" value={formData.final_quantity_kg} onChange={(e) => setFormData({...formData, final_quantity_kg: e.target.value})} required /></div><div><Label htmlFor="price_per_kg">Price/kg (₹)</Label><Input id="price_per_kg" type="number" step="0.01" value={formData.price_per_kg} onChange={(e) => setFormData({...formData, price_per_kg: e.target.value})} /></div></div><Button type="submit" className="w-full">Create Product</Button></form></DialogContent></Dialog>
};

// --- TraceProduct Component and Wrapper ---
const TraceProduct = ({ productId }) => {
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraceData = async () => {
      try {
        const response = await axios.get(`${API}/trace/${productId}`);
        setTraceData(response.data);
      } catch (error) {
        toast.error("Product not found or failed to load trace data");
      } finally {
        setLoading(false);
      }
    };
    fetchTraceData();
  }, [productId]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><QrCode className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-pulse" /><p className="text-gray-600">Loading trace data...</p></div></div>;
  if (!traceData) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><p className="text-red-600 text-xl mb-4">Product not found</p><Button onClick={() => window.location.href = '/'}><Home className="w-4 h-4 mr-2" />Go Home</Button></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center"><Badge className="mb-4 px-4 py-2 bg-emerald-100 text-emerald-800"><Shield className="w-4 h-4 mr-2" />Blockchain Verified</Badge><h1 className="text-4xl font-bold text-gray-900 mb-2">{traceData.product.product_name}</h1><p className="text-gray-600">Complete herb traceability journey</p></div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Leaf className="w-6 h-6 text-emerald-600" />Product Information</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-2 gap-6"><div><p className="text-sm text-gray-600">Batch ID</p><p className="font-semibold">{traceData.product.batch_id}</p></div><div><p className="text-sm text-gray-600">Species</p><p className="font-semibold">{traceData.product.species_name}</p></div><div><p className="text-sm text-gray-600">Manufacturer</p><p className="font-semibold">{traceData.product.manufacturer}</p></div><div><p className="text-sm text-gray-600">Manufacturing Date</p><p className="font-semibold">{new Date(traceData.product.manufacturing_date).toLocaleDateString()}</p></div><div><p className="text-sm text-gray-600">Quantity</p><p className="font-semibold">{traceData.product.final_quantity_kg} kg</p></div><div><p className="text-sm text-gray-600">Certifications</p><div className="flex gap-2 mt-1">{traceData.product.certifications.map((cert) => (<Badge key={cert} variant="outline">{cert}</Badge>))}</div></div></div></CardContent></Card>
          <Card className="bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6"><CardHeader className="p-0 mb-4"><CardTitle className="text-lg">Product QR Code</CardTitle></CardHeader><CardContent className="p-0 text-center">{traceData.product.qr_code_image ? (<img src={`data:image/png;base64,${traceData.product.qr_code_image}`} alt="Product QR Code" className="w-48 h-48 rounded-lg shadow-md"/>) : (<div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-500 text-sm rounded-lg">QR Code not available</div>)}<p className="text-xs text-gray-600 mt-4">Scan to verify this product's journey.</p></CardContent></Card>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <Card className="bg-white/80 backdrop-blur-sm"><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-600" />Collection Events ({traceData.collection_events.length})</CardTitle></CardHeader><CardContent><div className="space-y-4">{traceData.collection_events.map((event) => (<div key={event.id} className="p-4 bg-emerald-50 rounded-lg"><div className="flex justify-between items-start mb-2"><p className="font-semibold text-emerald-800">{event.collector_name}</p><Badge variant="outline">{event.quality_grade}</Badge></div><p className="text-sm text-gray-600 mb-1">{event.location_name}</p><p className="text-sm text-gray-600 mb-1">Quantity: {event.quantity_kg} kg</p><DisplayMap lat={event.latitude} lng={event.longitude} /><p className="text-xs text-gray-500 mt-2">{new Date(event.harvest_date).toLocaleDateString()}</p></div>))}</div></CardContent></Card>
          <Card className="bg-white/80 backdrop-blur-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />Processing Steps ({traceData.processing_steps.length})</CardTitle></CardHeader><CardContent><div className="space-y-4">{traceData.processing_steps.map((step) => (<div key={step.id} className="p-4 bg-blue-50 rounded-lg"><p className="font-semibold text-blue-800">{step.process_type}</p><p className="text-sm text-gray-600 mb-1">{step.facility_name}</p><p className="text-sm text-gray-600 mb-1">Operator: {step.operator_name}</p><p className="text-sm text-gray-600 mb-1">Equipment: {step.equipment_used}</p>{step.temperature && (<p className="text-sm text-gray-600 mb-1">Temperature: {step.temperature}°C</p>)}{step.duration_hours && (<p className="text-sm text-gray-600 mb-1">Duration: {step.duration_hours}h</p>)}<p className="text-sm text-gray-600">Output: {step.output_quantity_kg} kg</p><p className="text-xs text-gray-500 mt-2">{new Date(step.timestamp).toLocaleDateString()}</p></div>))}</div></CardContent></Card>
          <Card className="bg-white/80 backdrop-blur-sm"><CardHeader><CardTitle className="flex items-center gap-2"><FlaskConical className="w-5 h-5 text-orange-600" />Quality Tests ({traceData.quality_tests.length})</CardTitle></CardHeader><CardContent><div className="space-y-4">{traceData.quality_tests.map((test) => (<div key={test.id} className="p-4 bg-orange-50 rounded-lg"><div className="flex justify-between items-start mb-2"><p className="font-semibold text-orange-800">{test.test_type}</p><Badge variant={test.pass_fail === 'PASS' ? 'default' : 'destructive'}>{test.pass_fail}</Badge></div><p className="text-sm text-gray-600 mb-1">{test.lab_name}</p><p className="text-sm text-gray-600 mb-1">Tested by: {test.tested_by}</p>{test.test_value && (<p className="text-sm text-gray-600 mb-1">Result: {test.test_value} {test.test_unit}</p>)}<p className="text-sm text-gray-600">{test.test_result}</p><p className="text-xs text-gray-500 mt-2">{new Date(test.timestamp).toLocaleDateString()}</p></div>))}</div></CardContent></Card>
        </div>
        <div className="mt-8 text-center"><Button onClick={() => window.location.href = '/'} size="lg"><Home className="w-5 h-5 mr-2" />Back to Home</Button></div>
      </div>
    </div>
  );
};
const TraceProductWrapper = () => {
  const pathSegments = window.location.pathname.split('/');
  const productId = pathSegments[pathSegments.length - 1];
  return <TraceProduct productId={productId} />;
};

function App() {
  useLeaflet(); 
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trace/:productId" element={<TraceProductWrapper />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;

