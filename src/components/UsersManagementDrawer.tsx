import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { DRAWER_PRESETS, getDrawerHeaderClassName, getDrawerContentClassName } from '@/config/drawer';
import { DrawerCloseButton } from '@/components/DrawerCloseButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { X, Check, XCircle, Search, Upload, Users as UsersIcon, Trash2 } from 'lucide-react';

interface SharedUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  userType: string;
  hasAccess: boolean;
}

interface UsersManagementDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: SharedUser | null;
  onAddUser: (user: Omit<SharedUser, 'id'>) => void;
  onUpdateUser: (user: SharedUser) => void;
  onImportCsv: (users: SharedUser[]) => void;
  onAddEnrolledUsers: (users: SharedUser[]) => void;
  enrolledUsers: SharedUser[];
  loadingEnrolledUsers: boolean;
  onLoadEnrolledUsers: () => void;
}

export function UsersManagementDrawer({
  open,
  onOpenChange,
  editingUser,
  onAddUser,
  onUpdateUser,
  onImportCsv,
  onAddEnrolledUsers,
  enrolledUsers,
  loadingEnrolledUsers,
  onLoadEnrolledUsers,
}: UsersManagementDrawerProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'enrolled' | 'import'>('single');
  const [customUserTypes, setCustomUserTypes] = useState<string[]>([]);
  const [showAddUserType, setShowAddUserType] = useState(false);
  const [newUserTypeName, setNewUserTypeName] = useState('');
  
  // Default user types
  const defaultUserTypes = ['family', 'friend', 'colleague', 'client'];
  const allUserTypes = [...defaultUserTypes, ...customUserTypes];
  
  // Single user form
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const [isNewEmailValid, setIsNewEmailValid] = useState<boolean | null>(null);
  const [isNewPhoneValid, setIsNewPhoneValid] = useState<boolean | null>(null);
  
  // Edit user form
  const [editUserName, setEditUserName] = useState(editingUser?.name || '');
  const [editUserPhone, setEditUserPhone] = useState(editingUser?.phone || '');
  const [editUserEmail, setEditUserEmail] = useState(editingUser?.email || '');
  const [editUserType, setEditUserType] = useState(editingUser?.userType || '');
  const [isEditEmailValid, setIsEditEmailValid] = useState<boolean | null>(null);
  const [isEditPhoneValid, setIsEditPhoneValid] = useState<boolean | null>(null);
  
  // CSV import
  const [csvPreviewData, setCsvPreviewData] = useState<SharedUser[]>([]);
  const [csvImportErrors, setCsvImportErrors] = useState<{ duplicates: string[], invalidFormats: string[] }>({ duplicates: [], invalidFormats: [] });
  
  // Enrolled users
  const [selectedEnrolledIds, setSelectedEnrolledIds] = useState<string[]>([]);
  const [enrolledSearchQuery, setEnrolledSearchQuery] = useState('');
  const [enrolledUserType, setEnrolledUserType] = useState('family');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  };

  const handleNewEmailChange = (value: string) => {
    setNewUserEmail(value);
    if (value.length > 0) {
      setIsNewEmailValid(validateEmail(value));
    } else {
      setIsNewEmailValid(null);
    }
  };

  const handleNewPhoneChange = (value: string) => {
    setNewUserPhone(value);
    if (value.length > 0) {
      setIsNewPhoneValid(validatePhone(value));
    } else {
      setIsNewPhoneValid(null);
    }
  };

  const handleAddUser = () => {
    if (!newUserName || !newUserPhone || !newUserEmail || !selectedUserType || !isNewPhoneValid || !isNewEmailValid) {
      toast.error('Please fill all fields correctly');
      return;
    }

    onAddUser({
      name: newUserName,
      phone: newUserPhone,
      email: newUserEmail,
      userType: selectedUserType,
      hasAccess: true,
    });

    // Reset form
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');
    setSelectedUserType('');
    setIsNewEmailValid(null);
    setIsNewPhoneValid(null);
  };

  const handleAddCustomUserType = () => {
    const trimmedType = newUserTypeName.trim().toLowerCase();
    if (!trimmedType) {
      toast.error('Please enter a user type name');
      return;
    }
    if (allUserTypes.includes(trimmedType)) {
      toast.error('This user type already exists');
      return;
    }
    setCustomUserTypes([...customUserTypes, trimmedType]);
    setNewUserTypeName('');
    setShowAddUserType(false);
    toast.success('Custom user type added');
  };

  const handleEditEmailChange = (value: string) => {
    setEditUserEmail(value);
    if (value.length > 0) {
      setIsEditEmailValid(validateEmail(value));
    } else {
      setIsEditEmailValid(null);
    }
  };

  const handleEditPhoneChange = (value: string) => {
    setEditUserPhone(value);
    if (value.length > 0) {
      setIsEditPhoneValid(validatePhone(value));
    } else {
      setIsEditPhoneValid(null);
    }
  };

  const handleUpdateUser = () => {
    if (!editingUser || !editUserName || !editUserPhone || !editUserEmail || !editUserType || !isEditPhoneValid || !isEditEmailValid) {
      toast.error('Please fill all fields correctly');
      return;
    }

    onUpdateUser({
      ...editingUser,
      name: editUserName,
      phone: editUserPhone,
      email: editUserEmail,
      userType: editUserType,
    });
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1); // Skip header
      const users: SharedUser[] = [];
      const errors = { duplicates: [], invalidFormats: [] };

      rows.forEach((row) => {
        const [name, phone, email, userType, hasAccess] = row.split(',').map(cell => cell.trim());
        if (name && phone && email && userType) {
          users.push({
            id: Math.random().toString(36).substr(2, 9),
            name,
            phone,
            email,
            userType: userType.toLowerCase(),
            hasAccess: hasAccess?.toLowerCase() === 'true',
          });
        }
      });

      setCsvPreviewData(users);
      toast.success(`Loaded ${users.length} users from CSV`);
    };
    reader.readAsText(file);
  };

  const handleConfirmCsvImport = () => {
    onImportCsv(csvPreviewData);
    setCsvPreviewData([]);
  };

  const handleCancelCsvImport = () => {
    setCsvPreviewData([]);
  };

  const handleTogglePreviewUserAccess = (id: string) => {
    setCsvPreviewData(prev =>
      prev.map(user => user.id === id ? { ...user, hasAccess: !user.hasAccess } : user)
    );
  };

  const handleRemovePreviewUser = (id: string) => {
    setCsvPreviewData(prev => prev.filter(user => user.id !== id));
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'Name,Phone,Email,UserType,HasAccess\nJohn Doe,+1234567890,john@example.com,family,true\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shared_users_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV template downloaded');
  };

  const handleToggleEnrolledSelection = (id: string) => {
    setSelectedEnrolledIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleToggleAllEnrolled = () => {
    if (selectedEnrolledIds.length === enrolledUsers.length) {
      setSelectedEnrolledIds([]);
    } else {
      setSelectedEnrolledIds(enrolledUsers.map(u => u.id));
    }
  };

  const handleAddEnrolledUsers = () => {
    const usersToAdd = enrolledUsers
      .filter(u => selectedEnrolledIds.includes(u.id))
      .map(u => ({ ...u, userType: enrolledUserType, hasAccess: true }));
    
    onAddEnrolledUsers(usersToAdd);
    setSelectedEnrolledIds([]);
    setEnrolledSearchQuery('');
  };

  const filteredEnrolledUsers = enrolledUsers.filter(user =>
    user.name.toLowerCase().includes(enrolledSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(enrolledSearchQuery.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={DRAWER_PRESETS.form}>
        <SheetHeader className={getDrawerHeaderClassName('standard')}>
          <div className="flex items-center justify-between">
            <SheetTitle>
              {editingUser ? 'Edit Shared User' : 'Manage Users'}
            </SheetTitle>
            <DrawerCloseButton />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Default logged-in user data will be used for rendering
          </p>
        </SheetHeader>

        <div className={getDrawerContentClassName('standard')}>
          {editingUser ? (
            /* Edit User Form */
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Select Type Of User <span className="text-destructive">*</span>
                </label>
                <Select value={editUserType} onValueChange={setEditUserType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a User..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {allUserTypes.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  User name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Enter the user name"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    User Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="+91 0000000000"
                      value={editUserPhone}
                      onChange={(e) => handleEditPhoneChange(e.target.value)}
                      className={`mt-2 pr-10 ${
                        isEditPhoneValid === true 
                          ? 'border-green-500 focus-visible:ring-green-500' 
                          : isEditPhoneValid === false 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : ''
                      }`}
                    />
                    {isEditPhoneValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                        {isEditPhoneValid ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    User Email <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="user@email.com"
                      value={editUserEmail}
                      onChange={(e) => handleEditEmailChange(e.target.value)}
                      className={`mt-2 pr-10 ${
                        isEditEmailValid === true 
                          ? 'border-green-500 focus-visible:ring-green-500' 
                          : isEditEmailValid === false 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : ''
                      }`}
                    />
                    {isEditEmailValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                        {isEditEmailValid ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleUpdateUser}
                  className="flex-1 font-medium"
                  disabled={!editUserName || !editUserPhone || !editUserEmail || !editUserType || !isEditPhoneValid || !isEditEmailValid}
                >
                  Update User
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1 font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* Tabs for Different User Management Options */
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="single" className="text-xs sm:text-sm">Single User</TabsTrigger>
                <TabsTrigger value="import" className="text-xs sm:text-sm">Import CSV</TabsTrigger>
              </TabsList>

              {/* Single User Tab */}
              <TabsContent value="single" className="space-y-4 mt-0">
                <div>
                  <label className="text-sm font-medium">
                    Select Type Of User <span className="text-destructive">*</span>
                  </label>
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a User..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {allUserTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {!showAddUserType ? (
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => setShowAddUserType(true)}
                      className="mt-2 p-0 h-auto text-xs"
                    >
                      + Add Custom User Type
                    </Button>
                  ) : (
                    <div className="mt-3 p-3 border rounded-lg space-y-2 bg-muted/30">
                      <Input
                        placeholder="Enter custom user type (e.g., Partner, Vendor)"
                        value={newUserTypeName}
                        onChange={(e) => setNewUserTypeName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCustomUserType();
                          } else if (e.key === 'Escape') {
                            setShowAddUserType(false);
                            setNewUserTypeName('');
                          }
                        }}
                        className="text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleAddCustomUserType}
                          className="flex-1"
                        >
                          Add Type
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setShowAddUserType(false);
                            setNewUserTypeName('');
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    User name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Enter the user name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      User Phone Number <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="+91 0000000000"
                        value={newUserPhone}
                        onChange={(e) => handleNewPhoneChange(e.target.value)}
                        className={`mt-2 pr-10 ${
                          isNewPhoneValid === true 
                            ? 'border-green-500 focus-visible:ring-green-500' 
                            : isNewPhoneValid === false 
                            ? 'border-red-500 focus-visible:ring-red-500' 
                            : ''
                        }`}
                      />
                      {isNewPhoneValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                          {isNewPhoneValid ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      User Email <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="user@email.com"
                        value={newUserEmail}
                        onChange={(e) => handleNewEmailChange(e.target.value)}
                        className={`mt-2 pr-10 ${
                          isNewEmailValid === true 
                            ? 'border-green-500 focus-visible:ring-green-500' 
                            : isNewEmailValid === false 
                            ? 'border-red-500 focus-visible:ring-red-500' 
                            : ''
                        }`}
                      />
                      {isNewEmailValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                          {isNewEmailValid ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleAddUser} 
                  className="w-full font-medium"
                  disabled={!newUserName || !newUserPhone || !newUserEmail || !selectedUserType || !isNewPhoneValid || !isNewEmailValid}
                >
                  Add Shared User
                </Button>
              </TabsContent>

              {/* Import CSV Tab */}
              <TabsContent value="import" className="space-y-4 mt-0">
                {csvPreviewData.length === 0 ? (
                  <div className="space-y-6">
                    <div className="p-6 border-2 border-dashed border-border rounded-lg">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-center font-medium mb-2">Upload CSV File</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Import multiple users at once using a CSV file
                      </p>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvFileChange}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">CSV Format Requirements:</p>
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
                        <p>• Columns: Name, Phone, Email, UserType, HasAccess</p>
                        <p>• UserType: family, friend, colleague, or client</p>
                        <p>• HasAccess: true or false</p>
                      </div>
                      <Button variant="link" onClick={handleDownloadTemplate} className="p-0 h-auto">
                        Download CSV Template
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Preview CSV Import ({csvPreviewData.length} users)</h4>
                    </div>

                    <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Access</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreviewData.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell className="text-sm">{user.phone}</TableCell>
                              <TableCell className="text-sm">{user.email}</TableCell>
                              <TableCell className="text-sm">{user.userType}</TableCell>
                              <TableCell>
                                <Switch
                                  checked={user.hasAccess}
                                  onCheckedChange={() => handleTogglePreviewUserAccess(user.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemovePreviewUser(user.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleCancelCsvImport} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleConfirmCsvImport} className="flex-1">
                        Confirm Import
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
