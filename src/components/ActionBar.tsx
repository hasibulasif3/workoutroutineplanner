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
import { format } from "date-fns";
import {
  EMAIL_SIZE_LIMIT,
  FILE_SIZE_WARNING,
  EmailRecipients,
  generateEmailContent,
  formatWorkoutForExport
} from "@/utils/exportUtils";

interface ActionBarProps {
  workouts: WeeklyWorkouts;
  onWorkoutCreate: (workout: Workout) => void;
}

export function ActionBar({ workouts, onWorkoutCreate }: ActionBarProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "pdf">("json");
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipients>({ 
    to: "", 
    cc: "", 
    bcc: "" 
  });

  const handleDownload = async () => {
    const exportData = formatWorkoutForExport(workouts, selectedDays);
    
    if (exportData.metadata.fileSize > FILE_SIZE_WARNING) {
      const proceed = window.confirm(
        "The workout plan is quite large (over 5MB). This might affect performance when importing later. Continue with download?"
      );
      if (!proceed) return;
    }

    if (exportFormat === "pdf") {
      toast.error("PDF export coming soon!");
      return;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    const fileName = `workout-routine-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Workout routine downloaded successfully!');
    setShowDownloadDialog(false);
  };

  const handleEmail = () => {
    const { htmlContent, plainText } = generateEmailContent(workouts, selectedDays);
    const dateRange = format(new Date(), 'MMM d') + ' - ' + 
                     format(new Date(new Date().setDate(new Date().getDate() + 7)), 'MMM d, yyyy');
    const subject = encodeURIComponent(`Weekly Workout Routine (${dateRange})`);
    
    // Check email size
    const emailSize = new Blob([htmlContent]).size;
    if (emailSize > EMAIL_SIZE_LIMIT) {
      toast.error("Email content exceeds size limit (10MB). Please select fewer workouts.");
      return;
    }

    const mailtoLink = `mailto:${emailRecipients.to}?${
      emailRecipients.cc ? `cc=${emailRecipients.cc}&` : ''
    }${
      emailRecipients.bcc ? `bcc=${emailRecipients.bcc}&` : ''
    }subject=${subject}&body=${encodeURIComponent(plainText)}`;

    if (window.confirm("Open email client to send workout routine?")) {
      window.location.href = mailtoLink;
      toast.success('Opening email client...');
      setShowEmailDialog(false);
    }
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
                <Select value={exportFormat} onValueChange={(value: "json" | "pdf") => setExportFormat(value)}>
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
                        PDF
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Days</label>
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
              <Button onClick={handleDownload}>
                Download
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
                <label className="text-sm font-medium">To:</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  value={emailRecipients.to}
                  onChange={(e) => setEmailRecipients(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CC:</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  value={emailRecipients.cc}
                  onChange={(e) => setEmailRecipients(prev => ({ ...prev, cc: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">BCC:</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  value={emailRecipients.bcc}
                  onChange={(e) => setEmailRecipients(prev => ({ ...prev, bcc: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Days</label>
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
              <Button onClick={handleEmail}>
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <CreateWorkoutDialog onWorkoutCreate={onWorkoutCreate} />
    </div>
  );
}
