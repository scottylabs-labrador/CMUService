// src/app/dashboard/settings/page.tsx

'use client';

import { useState, useEffect, FormEvent, ChangeEvent, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNotification } from "@/context/NotificationContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Could not find mime type");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export default function SettingsPage() {
    const supabase = createClient();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFullName(profile.full_name || '');
                    setBio(profile.bio || '');
                    setAvatarUrl(profile.avatar_url);
                    setAvatarPreview(profile.avatar_url);
                }
            }
            setLoading(false); // This line fixes the "stuck on loading" issue
        };
        fetchProfile();
    }, [supabase]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
        if (event.target) event.target.value = '';
    };

    const handleSaveCrop = () => {
        const image = imgRef.current;
        if (!image || !completedCrop) return;

        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            ctx.beginPath();
            ctx.arc(completedCrop.width / 2, completedCrop.height / 2, completedCrop.width / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, completedCrop.width, completedCrop.height);
            const croppedImageUrl = canvas.toDataURL("image/png");
            setAvatarPreview(croppedImageUrl);
            const croppedFile = dataURLtoFile(croppedImageUrl, 'avatar.png');
            setNewAvatarFile(croppedFile);
        }
        setIsCropModalOpen(false);
    };

    const handleUpdateProfile = async (event: FormEvent) => {
        event.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        let updatedAvatarUrl = avatarUrl;

        if (newAvatarFile) {
            const filePath = `${user.id}/${newAvatarFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, newAvatarFile, { upsert: true });

            if (uploadError) {
                showNotification({ title: "Upload Error", description: "Error uploading avatar: " + uploadError.message });
                setIsSubmitting(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            updatedAvatarUrl = publicUrl;
        }

        const { error: updateError } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: fullName,
            bio: bio,
            avatar_url: updatedAvatarUrl,
            updated_at: new Date(),
        }, { onConflict: 'id' });


        if (updateError) {
            showNotification({ title: "Update Error", description: "Error updating profile: " + updateError.message });
        } else {
            setAvatarUrl(updatedAvatarUrl);
            showNotification({ title: "Success!", description: "Profile updated successfully!" });
        }
        setIsSubmitting(false);
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <>
            <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crop your new photo</DialogTitle>
                        <DialogDescription>Drag and resize the circle to select your profile picture.</DialogDescription>
                    </DialogHeader>
                    {imageToCrop && (
                        <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1} circularCrop>
                            <img ref={imgRef} src={imageToCrop} alt="Image to crop" style={{ maxHeight: '70vh' }}/>
                        </ReactCrop>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveCrop}>Save Crop</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account and public profile.</p>

                <form onSubmit={handleUpdateProfile}>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Public Profile</CardTitle>
                            <CardDescription>This is how others will see you on the site.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={avatarPreview || undefined} />
                                    <AvatarFallback>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button type="button" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
                                    <Input ref={fileInputRef} id="avatar-upload" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="full-name">Full Name</Label>
                                <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" placeholder="Tell us a little about yourself" value={bio} onChange={(e) => setBio(e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Profile'}</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </>
    );
}