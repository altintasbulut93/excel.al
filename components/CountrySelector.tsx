"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useFinancialStore } from "@/lib/store";
import { Check, Search, Globe, TrendingUp, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Country {
    code: string;
    name: string;
    name_local: string;
    flag_emoji: string;
    default_locale: string;
    currency_code: string;
    currency_symbol: string;
    default_exchange_rate: number;
}

interface CountryRule {
    country_code: string;
    vat_rate: number;
    employer_social_contrib: number;
}

interface CountrySelectorProps {
    open: boolean;
    onClose: () => void;
    onSelect: (country: Country) => void;
}

export function CountrySelector({ open, onClose, onSelect }: CountrySelectorProps) {
    const [countries, setCountries] = useState<Country[]>([]);
    const [rules, setRules] = useState<Record<string, CountryRule>>({});
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const { user } = useFinancialStore();

    useEffect(() => {
        if (open) {
            loadCountries();
        }
    }, [open]);

    async function loadCountries() {
        setLoading(true);
        try {
            // Load countries
            const { data: countriesData, error: countriesError } = await supabase
                .from('countries')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (countriesError) throw countriesError;

            // Load rules
            const { data: rulesData, error: rulesError } = await supabase
                .from('country_financial_rules')
                .select('*');

            if (rulesError) throw rulesError;

            setCountries(countriesData || []);

            // Convert rules to map
            const rulesMap: Record<string, CountryRule> = {};
            rulesData?.forEach(rule => {
                rulesMap[rule.country_code] = rule;
            });
            setRules(rulesMap);
        } catch (error) {
            console.error('Error loading countries:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSelect() {
        if (!selectedCountry || !user) return;

        try {
            // Update user profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    country_code: selectedCountry.code,
                    locale: selectedCountry.default_locale
                })
                .eq('id', user.id);

            if (error) throw error;

            onSelect(selectedCountry);
            onClose();
        } catch (error) {
            console.error('Error saving country:', error);
        }
    }

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.name_local.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold">
                                Select Your Country
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                Choose your country to get localized tax rules and currency
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Search */}
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="Search countries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>

                {/* Countries Grid */}
                <div className="flex-1 overflow-y-auto mt-4 pr-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredCountries.map((country) => {
                                const rule = rules[country.code];
                                const isSelected = selectedCountry?.code === country.code;

                                return (
                                    <Card
                                        key={country.code}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                                            isSelected && "ring-2 ring-blue-600 shadow-lg"
                                        )}
                                        onClick={() => setSelectedCountry(country)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="text-4xl">{country.flag_emoji}</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-lg">
                                                                {country.name}
                                                            </h3>
                                                            {country.name !== country.name_local && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    ({country.name_local})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {country.currency_symbol} {country.currency_code}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                {country.default_locale}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="p-1 rounded-full bg-blue-600">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tax Info */}
                                            {rule && (
                                                <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Shield className="w-4 h-4 text-green-600" />
                                                        <span className="text-muted-foreground">VAT:</span>
                                                        <span className="font-semibold">
                                                            {(rule.vat_rate * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                                        <span className="text-muted-foreground">Social:</span>
                                                        <span className="font-semibold">
                                                            {(rule.employer_social_contrib * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {!loading && filteredCountries.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Globe className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No countries found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search query
                            </p>
                        </div>
                    )}
                </div>

                {/* Selected Country Preview */}
                {selectedCountry && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{selectedCountry.flag_emoji}</div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Selected Country</p>
                                    <p className="font-semibold text-lg">{selectedCountry.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-600" />
                                <span className="text-sm font-medium">
                                    Auto-configured tax rules
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSelect}
                        disabled={!selectedCountry}
                        className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Confirm Selection
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
