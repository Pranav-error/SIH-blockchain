import axios from 'axios';
import { AlertCircle, CheckCircle2, Leaf, Lock, MapPin, Server, Shield, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * BlockchainStatus Component
 * Displays the status of the Hyperledger Fabric blockchain network
 * 
 * PATENT PENDING - Indian Patent Office
 * HerBlock - Ayurvedic Herb Traceability System
 */
export const BlockchainStatus = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await axios.get(`${API}/blockchain/status`);
                setStatus(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to connect to blockchain');
                setStatus(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="flex items-center justify-center h-32">
                    <div className="animate-pulse flex items-center gap-2">
                        <Server className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-500">Connecting to blockchain...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-2 border-red-200 bg-red-50/30">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            Hyperledger Fabric
                        </CardTitle>
                        <Badge className="bg-red-100 text-red-700">Disconnected</Badge>
                    </div>
                    <CardDescription className="text-xs">Unable to reach blockchain network</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-red-600">{error}</p>
                </CardContent>
            </Card>
        );
    }

    const isConnected = status?.status === 'connected';

    return (
        <Card className={`border-2 ${isConnected ? 'border-emerald-200 bg-emerald-50/50' : 'border-emerald-200 bg-emerald-50/30'}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Hyperledger Fabric
                    </CardTitle>
                    <Badge variant="default" className="bg-emerald-100 text-emerald-700">
                        {isConnected ? "Connected" : "Demo Mode"}
                    </Badge>
                </div>
                <CardDescription className="text-xs">
                    {status?.network || 'HerBlock Blockchain Network'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                        <Server className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">Channel:</span>
                        <span className="font-mono text-emerald-600">{status?.channel || 'herblock'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">Version:</span>
                        <span className="font-mono text-emerald-600">{status?.version || '1.1'}</span>
                    </div>
                </div>
                
                {status?.peers && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Active Peers:</p>
                        <div className="flex flex-wrap gap-1">
                            {status.peers.map((peer, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs py-0">
                                    {peer.name.split('.')[0]}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {status?.organizations && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Organizations:</p>
                        <div className="flex flex-wrap gap-1">
                            {status.organizations.map((org, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs py-0">
                                    {org}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {status?.patent_pending && (
                    <div className="mt-3 pt-2 border-t border-emerald-200">
                        <div className="flex items-center gap-1 text-xs text-emerald-700">
                            <Shield className="w-3 h-3" />
                            <span className="font-medium">Patent Pending - Indian Patent Office</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            GPS Geo-Fence Validation Technology
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

/**
 * BlockchainCollection Component
 * Shows blockchain-verified collection with geo-validation badge
 */
export const BlockchainCollection = ({ collection }) => {
    const isBlockchainVerified = collection?.blockchain_verified;
    const isGeoValidated = collection?.geo_validated;

    return (
        <div className={`p-3 rounded-lg border ${
            isBlockchainVerified 
                ? 'bg-emerald-50/50 border-emerald-200' 
                : 'bg-gray-50 border-gray-200'
        }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{collection.species_name}</p>
                        {isBlockchainVerified && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs py-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Blockchain Verified
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">{collection.collector_name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        {collection.location_name || collection.state}
                    </div>
                    {collection.blockchain_collection_id && (
                        <p className="text-xs font-mono text-emerald-600 mt-1">
                            ID: {collection.blockchain_collection_id}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <Badge variant="outline" className={
                        collection.quality_grade === 'A' ? 'border-green-500 text-green-700' :
                        collection.quality_grade === 'B' ? 'border-yellow-500 text-yellow-700' :
                        'border-gray-300 text-gray-600'
                    }>
                        {collection.quality_grade || 'Pending'}
                    </Badge>
                    {isGeoValidated && (
                        <div className="flex items-center justify-end gap-1 mt-2">
                            <Badge className="bg-blue-100 text-blue-700 text-xs py-0">
                                <MapPin className="w-3 h-3 mr-1" />
                                GPS Verified
                            </Badge>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        {collection.quantity_kg} kg
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * PatentFeatureBadge Component
 * Shows the patent-pending GPS validation feature
 */
export const PatentFeatureBadge = () => {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full border border-emerald-200">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-800">
                Patent Pending: GPS Geo-Fence Validation
            </span>
        </div>
    );
};

/**
 * EndorsementPanel Component
 * Shows live multi-org endorsement for the demo — judges can see both orgs signing every tx
 */
export const EndorsementPanel = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API}/blockchain/endorsement/last`);
                setData(res.data);
            } catch {
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
        const interval = setInterval(fetch, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return null;
    if (!data) return null;

    return (
        <Card className="border-2 border-blue-200 bg-blue-50/30 mt-3">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        Multi-Org Endorsement
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                        Block #{data.block_height}
                    </Badge>
                </div>
                <CardDescription className="text-xs">
                    {data.endorsement_policy}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {data.endorsers.map((e, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md bg-white border border-blue-100 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-gray-800">{e.msp_id}</p>
                                <p className="text-xs text-gray-500">{e.peer}:{e.port}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge variant="outline" className="text-xs border-emerald-400 text-emerald-700">Signed</Badge>
                            <p className="text-xs text-gray-400 mt-0.5">{e.role}</p>
                        </div>
                    </div>
                ))}
                <div className="flex items-center justify-between rounded-md bg-white border border-purple-100 px-3 py-2 mt-1">
                    <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-purple-500 shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-gray-800">Orderer ({data.orderer.consensus})</p>
                            <p className="text-xs text-gray-500">{data.orderer.name}:{data.orderer.port}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-xs border-purple-400 text-purple-700">Committed</Badge>
                </div>
                <p className="text-xs text-gray-500 pt-1 leading-relaxed">{data.note}</p>
            </CardContent>
        </Card>
    );
};

export default BlockchainStatus;
