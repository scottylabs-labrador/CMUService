'use client'; // Required for user interaction and state

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, ChangeEvent } from "react";
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


export default function SettingsPage() {
  const [avatarPreview, setAvatarPreview] = useState<string>("https://github.com/shadcn.png");
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveCrop = () => {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      return;
    }

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Create a circular clipping path
      ctx.beginPath();
      ctx.arc(
        completedCrop.width / 2,
        completedCrop.height / 2,
        completedCrop.width / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip(); // Clip to the circle

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      
      const croppedImageUrl = canvas.toDataURL("image/png");
      setAvatarPreview(croppedImageUrl);
    }
    
    setIsCropModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-2">
        Manage your account, profile, and notification settings.
      </p>
      <Separator className="my-6" />

      {/* Profile Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview} alt="User avatar" />
              <AvatarFallback>EC</AvatarFallback>
            </Avatar>
            <Button onClick={handleButtonClick}>Change Photo</Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif"
            />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <p className="text-sm text-muted-foreground">Eric Carnegie (from Andrew ID)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us a little about yourself" defaultValue="I'm a student at CMU passionate about software engineering and design."/>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save Profile</Button>
        </CardFooter>
      </Card>
      
      {/* Cropping Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crop your new photo</DialogTitle>
            <DialogDescription>
              Adjust the selection to crop your new profile picture.
            </DialogDescription>
          </DialogHeader>
          {imageToCrop && (
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={c => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img ref={imgRef} src={imageToCrop} alt="Image to crop" style={{ maxHeight: '70vh' }}/>
            </ReactCrop>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCrop}>Save Crop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose how you want to be notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">New Messages</p>
              <p className="text-sm text-muted-foreground">
                Get notified when someone sends you a message.
              </p>
            </div>
            <Switch defaultChecked id="messages-notifications"/>
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Order Updates</p>
              <p className="text-sm text-muted-foreground">
                Get notified about the status of your sales and purchases.
              </p>
            </div>
            <Switch defaultChecked id="orders-notifications"/>
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button>Save Notification Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

