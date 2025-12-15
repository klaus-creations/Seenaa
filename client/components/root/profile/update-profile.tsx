"use client";

import React, { useEffect, useState } from "react";
import { useGetMe, useUpdateProfile } from "@/lib/hooks/users/useUsers";
import type { UpdateProfileDto } from "@/types/user";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import {
  Loader2,
  Upload,
  Globe,
  MapPin,
  User,
  MessageSquare,
  Languages,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Form validation schema
const profileSchema = z.object({
  displayUsername: z.string().min(1, "Display name is required").max(30),
  bio: z.string().max(160).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  image: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  languages: z.array(z.string()).default([]),
});

export const UpdateProfile = () => {
  const { data: user, isLoading: isLoadingUser, error: loadError } = useGetMe();
  const {
    mutate: updateProfile,
    isPending: isSaving,
    error: saveError,
    isSuccess,
  } = useUpdateProfile();
  const [languagesInput, setLanguagesInput] = useState("");
  const [isAvatarHover, setIsAvatarHover] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayUsername: "",
      bio: "",
      country: "",
      city: "",
      image: "",
      languages: [],
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        displayUsername: user.displayUsername || "",
        bio: user.bio || "",
        country: user.country || "",
        city: user.city || "",
        image: user.image || "",
        languages: user.languages || [],
      });
      setLanguagesInput(user.languages?.join(", ") || "");
    }
  }, [user, form]);

  // Convert languages input to array and update form
  const processLanguages = () => {
    const languagesArray = languagesInput
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang.length > 0);
    form.setValue("languages", languagesArray);
    return languagesArray;
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    const processedValues = {
      ...values,
      languages: processLanguages(),
    };
    updateProfile(processedValues);
  };

  // Handle image upload simulation (you can integrate actual upload logic)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload the file and get a URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setUploadedImage(imageUrl);
        form.setValue("image", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add language tag on Enter
  const handleLanguageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && languagesInput.trim()) {
      e.preventDefault();
      const languagesArray = processLanguages();
      setLanguagesInput("");

      toast("add Languages separated by comma");
    }
  };

  // Remove language tag
  const removeLanguage = (index: number) => {
    const currentLanguages = [...form.getValues("languages")];
    currentLanguages.splice(index, 1);
    form.setValue("languages", currentLanguages);
    setLanguagesInput(currentLanguages.join(", "));
  };

  // Loading State
  if (isLoadingUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-[400px]"
      >
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </motion.div>
    );
  }

  // Error State
  if (loadError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">
              Failed to load profile
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mx-auto"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <CardTitle className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Edit Profile
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Update your public information and personalize your presence
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Success/Error Messages */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="font-medium text-emerald-800 dark:text-emerald-300">
                          Profile updated successfully!
                        </p>
                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                          Your changes have been saved
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {saveError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">
                          {saveError.response?.data?.message ||
                            "Something went wrong"}
                        </p>
                        <p className="text-sm text-destructive/80 mt-1">
                          Please check your information and try again
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Image Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <Label className="text-base font-semibold">
                  Profile Picture
                </Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div
                    className="relative group"
                    onMouseEnter={() => setIsAvatarHover(true)}
                    onMouseLeave={() => setIsAvatarHover(false)}
                  >
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                      <AvatarImage
                        src={
                          uploadedImage ||
                          form.getValues("image") ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-white text-xl">
                        {form.getValues("displayUsername")?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <motion.label
                      initial={false}
                      animate={{
                        scale: isAvatarHover ? 1 : 0.8,
                        opacity: isAvatarHover ? 1 : 0,
                      }}
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm"
                      htmlFor="avatar-upload"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </motion.label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  {...field}
                                  placeholder="Or paste image URL..."
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    document
                                      .getElementById("avatar-upload")
                                      ?.click()
                                  }
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Upload a new image or paste a URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <Separator />

              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <Label className="text-base font-semibold">
                  Personal Information
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="displayUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Display Name
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Country
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ethiopia" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          City
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Addis Ababa" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>

              <Separator />

              {/* Bio Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Bio
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            {...field}
                            placeholder="Tell us a little about yourself..."
                            className="min-h-[120px] resize-none"
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                            {field.value?.length || 0}/160
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Share a brief introduction about yourself
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <Separator />

              {/* Languages Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="languages"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Languages
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            value={languagesInput}
                            onChange={(e) => setLanguagesInput(e.target.value)}
                            onKeyDown={handleLanguageKeyDown}
                            placeholder="Type languages and press Enter or separate with commas..."
                          />
                          {form.getValues("languages").length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {form
                                .getValues("languages")
                                .map((lang, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="px-3 py-1.5 text-sm"
                                  >
                                    {lang}
                                    <button
                                      type="button"
                                      onClick={() => removeLanguage(index)}
                                      className="ml-2 hover:text-destructive transition-colors"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Press Enter or separate with commas to add languages
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            </CardContent>

            <CardFooter className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="hover:scale-[1.02] transition-transform"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="relative overflow-hidden group min-w-[120px] hover:scale-[1.02] transition-transform"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Save Changes</span>
                    <motion.div
                      className="absolute inset-0 bg-linear-to-r from-primary to-primary/60"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </motion.div>
  );
};
