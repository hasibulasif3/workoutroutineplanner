import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Mail, FileJson, FileText } from "lucide-react";
import { CreateWorkoutDialog } from "./CreateWorkoutDialog";
import { toast } from "sonner";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { downloadWorkouts } from "@/utils/downloadUtils";
import { generateEmailContent, validateEmails, emailSchema } from "@/utils/emailUtils";
import { supabase } from "@/integrations/supabase/client";

interface ActionBarProps {
  workouts: WeeklyWorkouts;
  onWorkoutCreate: (workout: Workout) => void;
}

export function ActionBar({ workouts, onWorkoutCreate }: ActionBarProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "pdf">("json");
  const [isLoading, setIsLoading] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState({
    to: "",
    cc: "",
    bcc: "",
  });

  const handleDownload = async () => {
    try {
      if (selectedDays.length === 0) {
        toast.error("Please select at least one day to download");
        return;
      }

      setIsLoading(true);
      const fileName = downloadWorkouts(workouts, selectedDays, exportFormat);
      toast.success(`Downloaded ${fileName} successfully!`);
      setShowDownloadDialog(false);
      setSelectedDays([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download workouts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmail = async () => {
    try {
      if (selectedDays.length === 0) {
        toast.error("Please select at least one day");
        return;
      }

      setIsLoading(true);

      // Validate email addresses
      const validatedData = emailSchema.parse(emailRecipients);
      const toEmails = validateEmails(validatedData.to);
      const ccEmails = validatedData.cc ? validateEmails(validatedData.cc) : [];
      const bccEmails = validatedData.bcc ? validateEmails(validatedData.bcc) : [];

      if (toEmails.length === 0) {
        throw new Error("Please enter at least one valid recipient email");
      }

      const { htmlContent, plainText } = generateEmailContent(workouts, selectedDays);
      const dateRange = new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }) + ' - ' + 
      new Date(new Date().setDate(new Date().getDate() + 7))
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmails,
          cc: ccEmails,
          bcc: bccEmails,
          subject: `Weekly Workout Routine (${dateRange})`,
          html: htmlContent,
          text: plainText,
        },
      });

      if (error) throw error;

      toast.success("Email sent successfully!");
      setShowEmailDialog(false);
      setSelectedDays([]);
      setEmailRecipients({ to: "", cc: "", bcc: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedDays(selectedDays.length === Object.keys(workouts).length ? [] : Object.keys(workouts));
  };

  return (
    <div className="w-full max-w-4xl flex justify-between items-center mt-6">
      <div className="flex gap-2">
        <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 hover:scale-105 transition-transform"
            >
              <Download size={16} />
              Download
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Download Workout Routine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select 
                  value={exportFormat} 
                  onValueChange={(value: "json" | "pdf") => setExportFormat(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4" />
                        JSON
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        PDF (Coming Soon)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Select Days</label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedDays.length === Object.keys(workouts).length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(workouts).map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={selectedDays.includes(day)}
                        onCheckedChange={(checked) => {
                          setSelectedDays(prev =>
                            checked
                              ? [...prev, day]
                              : prev.filter(d => d !== day)
                          );
                        }}
                      />
                      <label htmlFor={day} className="text-sm">{day}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDownload} disabled={isLoading}>
                {isLoading ? "Downloading..." : "Download"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          className="gap-2 hover:scale-105 transition-transform"
          onClick={() => toast.success('Sync feature coming soon!')}
        >
          <RefreshCw size={16} />
          Sync
        </Button>

        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 hover:scale-105 transition-transform"
            >
              <Mail size={16} />
              Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Email Workout Routine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">To: (separate multiple emails with commas)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={emailRecipients.to}
                  onChange={(e) => setEmailRecipients(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="email@example.com, another@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CC: (optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={emailRecipients.cc}
                  onChange={(e) => setEmailRecipients(prev => ({ ...prev, cc: e.target.value }))}
                  placeholder="email@example.com, another@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">BCC: (optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={emailRecipients.bcc}
                  onChange={(e) => setEmailRecipients(prev => ({ ...prev, bcc: e.target.value }))}
                  placeholder="email@example.com, another@example.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Select Days</label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedDays.length === Object.keys(workouts).length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(workouts).map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`email-${day}`}
                        checked={selectedDays.includes(day)}
                        onCheckedChange={(checked) => {
                          setSelectedDays(prev =>
                            checked
                              ? [...prev, day]
                              : prev.filter(d => d !== day)
                          );
                        }}
                      />
                      <label htmlFor={`email-${day}`} className="text-sm">{day}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEmail} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <CreateWorkoutDialog onWorkoutCreate={onWorkoutCreate} />
    </div>
  );
}