import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MultiSelectDropdown } from "@/components/ui/multi-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuthService } from "@/services/AuthService"
import { WorkoutService } from "@/services/WorkoutService"

import { ChevronDownIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [gender, setGender] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [personalGoals, setPersonalGoals] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  const personalGoalsOptions = [
    { value: "lose_weight", label: "Weight Loss" },
    { value: "build_muscle", label: "Build Muscle" },
    { value: "increase_endurance", label: "Increase Endurance" },
    { value: "improve_flexibility", label: "Improve Flexibility" },
    { value: "improve_health", label: "Improve Overall Health" },
    { value: "sports_performance", label: "Sports Performance" },
    { value: "rehabilitation", label: "Rehabilitation" },
    { value: "other", label: "Other" }
  ]

  useEffect(() => {
    // Basic validation: check required fields
    const isValid = gender && pronouns && date && height && weight && fitnessLevel && fitnessGoal && personalGoals.length > 0;
    setIsFormValid(!!isValid);
  }, [gender, pronouns, date, height, weight, fitnessLevel, fitnessGoal, personalGoals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      gender,
      pronouns,
      dateOfBirth: date,
      height,
      weight,
      fitnessLevel,
      fitnessGoal,
      personalGoals,
    }
    console.log("Onboarding form data:", data)

    try {
      const [success, message] = await new WorkoutService().updateProfile(data);

      if (success) {
        const success = await new AuthService().markAsCompleted();

        if (success) {
          toast.success("Onboarding completed successfully!");
          navigate('/home');
        } else {
          toast.error("Failed to complete onboarding");
        }
        // toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile: " + message);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating profile:", error.message);
      }
      toast.error("Failed to update profile");
    }
  }

  return (
    <div className="flex flex-col grow items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Onboarding</CardTitle>
              <CardDescription>
                Help us to know you better by completing the onboarding form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <FieldSet>
                    <FieldGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="onboarding-gender">Gender</FieldLabel>
                          <Select value={gender} onValueChange={setGender} defaultValue="">
                            <SelectTrigger id="onboarding-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="onboarding-pronouns">Pronouns</FieldLabel>
                          <Select value={pronouns} onValueChange={setPronouns} defaultValue="">
                            <SelectTrigger id="onboarding-pronouns">
                              <SelectValue placeholder="Select pronouns" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="she/her">She/Her</SelectItem>
                              <SelectItem value="he/him">He/Him</SelectItem>
                              <SelectItem value="they/them">They/Them</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                      <Field>
                        <FieldLabel htmlFor="onboarding-birthday">Date of birth</FieldLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date"
                              className={`justify-between font-normal bg-card hover:bg-transparent w-full ${date ? "" : "text-muted-foreground hover:text-muted-foreground"}`}
                            >
                              {date ? date.toLocaleDateString() : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setDate(date)
                                setOpen(false)
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="onboarding-height">Height (cm)</FieldLabel>
                          <Input id="onboarding-height" type="number" min="0" placeholder="e.g. 170" required value={height} onChange={e => setHeight(e.target.value)} />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="onboarding-weight">Weight (kg)</FieldLabel>
                          <Input id="onboarding-weight" type="number" min="0" placeholder="e.g. 65" required value={weight} onChange={e => setWeight(e.target.value)} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="onboarding-fitness-level">Fitness Level</FieldLabel>
                          <Select value={fitnessLevel} onValueChange={setFitnessLevel} defaultValue="">
                            <SelectTrigger id="onboarding-fitness-level">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="onboarding-fitness-goal">Fitness Goal</FieldLabel>
                          <Select value={fitnessGoal} onValueChange={setFitnessGoal} defaultValue="">
                            <SelectTrigger id="onboarding-fitness-goal">
                              <SelectValue placeholder="Select goal" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weight_loss">Weight Loss</SelectItem>
                              <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                              <SelectItem value="endurance">Endurance</SelectItem>
                              <SelectItem value="flexibility">Flexibility</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                      <Field>
                        <FieldLabel>Personal Goals</FieldLabel>
                        <MultiSelectDropdown
                          options={personalGoalsOptions}
                          selected={personalGoals}
                          onChange={setPersonalGoals}
                          placeholder="Select personal goals"
                          showSearch={false}
                        />
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                  <Field orientation="horizontal" className="w-full justify-end">
                    <Button type="submit" disabled={!isFormValid}>Submit</Button>
                    <Button variant="outline" type="button" onClick={() => navigate('/')}>
                      Cancel
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  )
}